"""
Rate limiting for the public compile service.

The demo is a static site on GitHub Pages, so it cannot hold a secret: anything
shipped in the bundle is readable by anyone who opens developer tools. A key
would be theatre. CORS is not a control either, because it is enforced by
browsers and ignored by anything else.

What is left, and what actually works, is limiting by client address:

  - A short window catches bursts.
  - A long window catches sustained scraping that stays under the burst limit.

Compilation spends no model tokens, so the exposure is compute and egress on
the host rather than an API bill. That makes throttling the right response
rather than a hard gate, which would break the demo for ordinary visitors.

Kept free of framework types so the decisions can be tested directly.
"""

from __future__ import annotations

import os
from collections import deque
from dataclasses import dataclass, field
from typing import Deque, Dict, Iterable, Optional, Tuple


def client_address(headers: Iterable[Tuple[str, str]], trusted_hops: int = 1) -> Optional[str]:
    """
    The caller's address, read from X-Forwarded-For.

    Each proxy appends the address it received the request from, so the real
    client sits ``trusted_hops`` positions from the right. Reading the leftmost
    entry would trust a header the caller sets themselves, which for a rate
    limiter is not a subtle flaw: rotating a fake value would lift the limit
    entirely.
    """
    lookup = {name.lower(): value for name, value in headers}

    forwarded = lookup.get("x-forwarded-for")
    if forwarded:
        chain = [part.strip() for part in forwarded.split(",") if part.strip()]
        if chain:
            index = max(0, len(chain) - max(1, trusted_hops))
            return _normalise(chain[index])

    for header in ("x-real-ip", "cf-connecting-ip", "true-client-ip"):
        value = lookup.get(header)
        if value and value.strip():
            return _normalise(value)

    return None


def _normalise(address: str) -> str:
    value = address.strip()
    if value.startswith("["):
        close = value.find("]")
        if close != -1:
            value = value[1:close]
    elif value.count(":") == 1:
        value = value.split(":")[0]
    if value.lower().startswith("::ffff:"):
        value = value[7:]
    return value.lower()


@dataclass
class Decision:
    allowed: bool
    #: Seconds the caller should wait before retrying, when refused.
    retry_after: int = 0
    #: Requests left in the short window, for the RateLimit headers.
    remaining: int = 0
    #: Which window refused, for the message shown to a person.
    window: str = ""


@dataclass
class Window:
    """A sliding window: how many requests are permitted over how long."""

    limit: int
    seconds: int
    name: str
    hits: Dict[str, Deque[float]] = field(default_factory=dict)

    def check(self, key: str, now: float) -> Tuple[bool, int, int]:
        """Returns (allowed, remaining, retry_after) without recording a hit."""
        recent = self.hits.get(key)
        if recent is None:
            return True, self.limit - 1, 0

        cutoff = now - self.seconds
        while recent and recent[0] <= cutoff:
            recent.popleft()

        if len(recent) >= self.limit:
            retry_after = max(1, int(recent[0] + self.seconds - now) + 1)
            return False, 0, retry_after

        return True, self.limit - len(recent) - 1, 0

    def record(self, key: str, now: float) -> None:
        self.hits.setdefault(key, deque()).append(now)

    def evict(self, now: float) -> None:
        """Drops addresses with nothing left in the window."""
        cutoff = now - self.seconds
        for key in list(self.hits):
            recent = self.hits[key]
            while recent and recent[0] <= cutoff:
                recent.popleft()
            if not recent:
                del self.hits[key]


class RateLimiter:
    """
    Two sliding windows over the same address.

    Eviction matters as much as the limits: without it the address table grows
    for every caller ever seen, which turns the protection into its own denial
    of service. Sweeping is amortised rather than scheduled, so there is no
    background task to supervise.
    """

    def __init__(
        self,
        per_minute: int = 30,
        per_hour: int = 300,
        max_tracked: int = 10_000,
    ) -> None:
        self.minute = Window(limit=per_minute, seconds=60, name="minute")
        self.hour = Window(limit=per_hour, seconds=3600, name="hour")
        self.max_tracked = max_tracked
        self._since_sweep = 0

    @classmethod
    def from_environment(cls, environ: Optional[Dict[str, str]] = None) -> "RateLimiter":
        source = environ if environ is not None else dict(os.environ)
        return cls(
            per_minute=int(source.get("ITS_RATE_LIMIT_PER_MINUTE", "30")),
            per_hour=int(source.get("ITS_RATE_LIMIT_PER_HOUR", "300")),
            max_tracked=int(source.get("ITS_RATE_LIMIT_MAX_TRACKED", "10000")),
        )

    @property
    def enabled(self) -> bool:
        return self.minute.limit > 0 or self.hour.limit > 0

    def check(self, key: str, now: float) -> Decision:
        """Decides on a request and records it when allowed."""
        self._maybe_sweep(now)

        for window in (self.minute, self.hour):
            if window.limit <= 0:
                continue
            allowed, _, retry_after = window.check(key, now)
            if not allowed:
                return Decision(
                    allowed=False,
                    retry_after=retry_after,
                    remaining=0,
                    window=window.name,
                )

        remaining = self.minute.limit
        for window in (self.minute, self.hour):
            if window.limit <= 0:
                continue
            window.record(key, now)
            if window is self.minute:
                remaining = max(0, window.limit - len(window.hits.get(key, ())))

        return Decision(allowed=True, remaining=remaining)

    def _maybe_sweep(self, now: float) -> None:
        self._since_sweep += 1
        over_capacity = len(self.minute.hits) > self.max_tracked or len(self.hour.hits) > self.max_tracked
        if self._since_sweep < 500 and not over_capacity:
            return
        self._since_sweep = 0
        self.minute.evict(now)
        self.hour.evict(now)
