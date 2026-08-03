"""Tests for the compile service's rate limiting."""

from rate_limit import RateLimiter, Window, client_address


class TestClientAddress:
    def test_reads_the_rightmost_forwarded_entry(self) -> None:
        # The caller can set X-Forwarded-For themselves; the proxy appends the
        # address it actually saw. Trusting the leftmost entry would let anyone
        # lift their own limit by rotating a fake value.
        headers = [("X-Forwarded-For", "9.9.9.9, 203.0.113.7")]
        assert client_address(headers) == "203.0.113.7"

    def test_a_spoofed_chain_cannot_change_the_key(self) -> None:
        spoofed = [("X-Forwarded-For", "1.1.1.1, 2.2.2.2, 203.0.113.7")]
        honest = [("X-Forwarded-For", "203.0.113.7")]
        assert client_address(spoofed) == client_address(honest)

    def test_steps_back_further_for_more_proxies(self) -> None:
        headers = [("X-Forwarded-For", "9.9.9.9, 203.0.113.7, 10.0.0.1")]
        assert client_address(headers, trusted_hops=2) == "203.0.113.7"

    def test_falls_back_to_single_value_headers(self) -> None:
        assert client_address([("X-Real-IP", "203.0.113.9")]) == "203.0.113.9"

    def test_header_names_are_case_insensitive(self) -> None:
        assert client_address([("x-forwarded-for", "203.0.113.7")]) == "203.0.113.7"

    def test_returns_none_when_nothing_identifies_the_caller(self) -> None:
        assert client_address([]) is None

    def test_normalises_ports_and_mapped_addresses(self) -> None:
        assert client_address([("X-Forwarded-For", "203.0.113.7:52344")]) == "203.0.113.7"
        assert client_address([("X-Forwarded-For", "::ffff:203.0.113.7")]) == "203.0.113.7"
        assert client_address([("X-Forwarded-For", "[2001:db8::1]:443")]) == "2001:db8::1"


class TestWindow:
    def test_allows_up_to_the_limit(self) -> None:
        window = Window(limit=3, seconds=60, name="test")
        for i in range(3):
            allowed, _, _ = window.check("a", now=100.0)
            assert allowed, f"request {i} should be allowed"
            window.record("a", now=100.0)
        allowed, _, retry = window.check("a", now=100.0)
        assert not allowed
        assert retry > 0

    def test_the_window_slides(self) -> None:
        window = Window(limit=2, seconds=60, name="test")
        window.record("a", now=100.0)
        window.record("a", now=101.0)
        assert not window.check("a", now=102.0)[0]
        # The first two hits have aged out by now.
        assert window.check("a", now=162.0)[0]

    def test_addresses_are_counted_separately(self) -> None:
        window = Window(limit=1, seconds=60, name="test")
        window.record("a", now=100.0)
        assert not window.check("a", now=100.0)[0]
        assert window.check("b", now=100.0)[0]

    def test_eviction_drops_addresses_with_nothing_left(self) -> None:
        window = Window(limit=5, seconds=60, name="test")
        window.record("a", now=100.0)
        window.evict(now=100.0)
        assert "a" in window.hits
        window.evict(now=200.0)
        assert "a" not in window.hits


class TestRateLimiter:
    def test_allows_traffic_under_both_limits(self) -> None:
        limiter = RateLimiter(per_minute=5, per_hour=100)
        for _ in range(5):
            assert limiter.check("a", now=100.0).allowed

    def test_the_short_window_catches_a_burst(self) -> None:
        limiter = RateLimiter(per_minute=3, per_hour=1000)
        for _ in range(3):
            limiter.check("a", now=100.0)
        decision = limiter.check("a", now=100.0)
        assert not decision.allowed
        assert decision.window == "minute"
        assert decision.retry_after > 0

    def test_the_long_window_catches_sustained_scraping(self) -> None:
        # Paced to stay under the per-minute limit forever, which is exactly
        # what the hourly window exists to stop.
        limiter = RateLimiter(per_minute=10, per_hour=20)
        now = 0.0
        for _ in range(20):
            assert limiter.check("a", now=now).allowed
            now += 30
        decision = limiter.check("a", now=now)
        assert not decision.allowed
        assert decision.window == "hour"

    def test_a_refusal_does_not_count_against_the_caller(self) -> None:
        # Otherwise a client retrying in a loop could never recover, because
        # each rejected attempt would extend its own penalty.
        limiter = RateLimiter(per_minute=2, per_hour=1000)
        limiter.check("a", now=100.0)
        limiter.check("a", now=100.0)
        for _ in range(50):
            assert not limiter.check("a", now=100.0).allowed
        assert limiter.check("a", now=161.0).allowed

    def test_one_caller_cannot_exhaust_another(self) -> None:
        limiter = RateLimiter(per_minute=1, per_hour=10)
        assert limiter.check("noisy", now=100.0).allowed
        assert not limiter.check("noisy", now=100.0).allowed
        assert limiter.check("quiet", now=100.0).allowed

    def test_reports_how_many_requests_remain(self) -> None:
        limiter = RateLimiter(per_minute=3, per_hour=100)
        assert limiter.check("a", now=100.0).remaining == 2
        assert limiter.check("a", now=100.0).remaining == 1
        assert limiter.check("a", now=100.0).remaining == 0

    def test_a_zero_limit_disables_that_window(self) -> None:
        limiter = RateLimiter(per_minute=0, per_hour=2)
        for _ in range(2):
            assert limiter.check("a", now=100.0).allowed
        assert not limiter.check("a", now=100.0).allowed

    def test_the_address_table_does_not_grow_without_bound(self) -> None:
        # Without eviction the table grows for every caller ever seen, which
        # turns the protection into its own denial of service.
        limiter = RateLimiter(per_minute=5, per_hour=50, max_tracked=10)
        for i in range(600):
            limiter.check(f"addr-{i}", now=0.0)
        limiter.check("later", now=10_000.0)
        assert len(limiter.minute.hits) <= 11
        assert len(limiter.hour.hits) <= 11

    def test_reads_its_limits_from_the_environment(self) -> None:
        limiter = RateLimiter.from_environment(
            {"ITS_RATE_LIMIT_PER_MINUTE": "7", "ITS_RATE_LIMIT_PER_HOUR": "70"}
        )
        assert limiter.minute.limit == 7
        assert limiter.hour.limit == 70

    def test_defaults_are_generous_enough_for_a_person_using_the_demo(self) -> None:
        limiter = RateLimiter.from_environment({})
        assert limiter.minute.limit >= 20
        assert limiter.hour.limit >= 200
