"""HTTP compile service for ITS templates.

Wraps the its-compiler package (the ITS reference implementation) so the
demo front end can compile templates server-side. Exposes:

    POST /compile   {"template": {...}, "variables": {...}}
    POST /validate  {"template": {...}}
    GET  /health
"""

import os
import time
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from its_compiler import ITSCompiler
from rate_limit import RateLimiter, client_address

# Comma-separated allowed origins. The default covers the published demo on
# GitHub Pages plus common local dev origins; the dev proxy keeps local
# requests same-origin anyway. Set ITS_CORS_ORIGINS to override.
DEFAULT_CORS_ORIGINS = (
    "https://alexanderparker.github.io,"
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "http://localhost:4173,"
    "http://127.0.0.1:4173"
)

app = FastAPI(title="ITS Compile Service", version="0.1.0")

# This service is public and costs the operator compute and egress. CORS does
# not protect it: browsers enforce it, anything else ignores it. The demo is a
# static site so it cannot hold a secret either, which leaves throttling by
# address as the control that actually works.
LIMITER = RateLimiter.from_environment()

# Compilation is bounded by the compiler's own limits, but the body is read
# before any of those apply, so it is capped here first.
MAX_REQUEST_BYTES = int(os.getenv("ITS_MAX_REQUEST_BYTES", str(512 * 1024)))

# Paths that must answer even when a caller is being throttled, so the platform
# health check never trips the limiter.
UNLIMITED_PATHS = {"/health", "/docs", "/openapi.json"}


@app.middleware("http")
async def guard(request: Request, call_next):  # type: ignore[no-untyped-def]
    if request.method == "OPTIONS" or request.url.path in UNLIMITED_PATHS:
        return await call_next(request)

    declared = request.headers.get("content-length")
    if declared is not None and declared.isdigit() and int(declared) > MAX_REQUEST_BYTES:
        return JSONResponse(
            status_code=413,
            content={
                "ok": False,
                "error": f"Request body exceeds {MAX_REQUEST_BYTES} bytes.",
            },
        )

    if LIMITER.enabled:
        # An unidentifiable caller shares one bucket rather than bypassing the
        # limit, which is the safe direction to fail.
        key = client_address(request.headers.items()) or "unknown"
        decision = LIMITER.check(key, time.monotonic())
        if not decision.allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "ok": False,
                    "error": (
                        "This demo service limits how often it can be called. "
                        f"Try again in {decision.retry_after} seconds, or run it "
                        "locally without limits."
                    ),
                },
                headers={
                    "Retry-After": str(decision.retry_after),
                    "RateLimit-Limit": str(LIMITER.minute.limit),
                    "RateLimit-Remaining": "0",
                    "RateLimit-Reset": str(decision.retry_after),
                },
            )

        response = await call_next(request)
        response.headers["RateLimit-Limit"] = str(LIMITER.minute.limit)
        response.headers["RateLimit-Remaining"] = str(decision.remaining)
        return response

    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("ITS_CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
        if origin.strip()
    ],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


class CompileRequest(BaseModel):
    template: Dict[str, Any]
    variables: Optional[Dict[str, Any]] = Field(default=None)


class CompileResponse(BaseModel):
    ok: bool
    prompt: Optional[str] = None
    warnings: list[str] = Field(default_factory=list)
    error: Optional[str] = None
    compiler: str = "its-compiler (python)"


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/compile", response_model=CompileResponse)
def compile_template(request: CompileRequest) -> CompileResponse:
    compiler = ITSCompiler()
    try:
        result = compiler.compile(request.template, variables=request.variables or {})
    except Exception as error:  # noqa: BLE001 - surfaced to the client as a message
        return CompileResponse(ok=False, error=str(error))
    warnings = [str(w) for w in getattr(result, "warnings", []) or []]
    return CompileResponse(ok=True, prompt=result.prompt, warnings=warnings)


@app.post("/validate", response_model=CompileResponse)
def validate_template(request: CompileRequest) -> CompileResponse:
    compiler = ITSCompiler()
    try:
        validation = compiler.validate(request.template)
    except Exception as error:  # noqa: BLE001
        return CompileResponse(ok=False, error=str(error))
    is_valid = bool(getattr(validation, "is_valid", False))
    errors = [str(e) for e in getattr(validation, "errors", []) or []]
    warnings = [str(w) for w in getattr(validation, "warnings", []) or []]
    return CompileResponse(
        ok=is_valid,
        warnings=warnings,
        error="; ".join(errors) if errors else None,
    )
