"""HTTP compile service for ITS templates.

Wraps the its-compiler package (the ITS reference implementation) so the
demo front end can compile templates server-side. Exposes:

    POST /compile   {"template": {...}, "variables": {...}}
    POST /validate  {"template": {...}}
    GET  /health
"""

from typing import Any, Dict, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from its_compiler import ITSCompiler

app = FastAPI(title="ITS Compile Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
