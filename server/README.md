# ITS Compile Service

A small FastAPI wrapper around the [its-compiler](https://test.pypi.org/project/its-compiler/) Python package, giving the demo front end a server-side compile option.

## Setup

Requires [uv](https://docs.astral.sh/uv/) (`winget install astral-sh.uv`, `brew install uv`, or the install script on their site). uv manages the virtual environment and dependencies automatically from `pyproject.toml`; its-compiler is pinned to TestPyPI while all other dependencies resolve from PyPI.

```bash
cd server
uv run fastapi dev app.py --port 8402
```

The first run creates the environment and installs everything; subsequent runs start immediately. `fastapi dev` serves with auto-reload; use `uv run fastapi run app.py --port 8402` for a production-style server.

The demo's Server compile option talks to this service through the Vite dev proxy at `/its-api`, so no cross-origin requests are involved during development. The service also sends permissive CORS headers for direct access from other origins.

## Endpoints

| Method | Path      | Body                                    | Returns                          |
| ------ | --------- | --------------------------------------- | -------------------------------- |
| POST   | /compile  | `{"template": {...}, "variables": {}}`  | `{ok, prompt, warnings, error}` |
| POST   | /validate | `{"template": {...}}`                   | `{ok, warnings, error}`         |
| GET    | /health   |                                          | `{"status": "ok"}`              |

Notes:

- CORS is open (`*`) because this is a local development service. Restrict `allow_origins` before deploying anywhere shared.
- Templates using `extends` fetch schemas over HTTPS from the server process, so it needs outbound network access.
