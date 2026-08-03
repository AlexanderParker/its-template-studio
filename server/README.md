# ITS Compile Service

A small FastAPI wrapper around the [its-compiler](https://pypi.org/project/its-compiler/) Python package, giving the demo front end a server-side compile option.

## Setup

Requires [uv](https://docs.astral.sh/uv/) (`winget install astral-sh.uv`, `brew install uv`, or the install script on their site). uv manages the virtual environment and dependencies automatically from `pyproject.toml`; its-compiler resolves from git via `[tool.uv.sources]` until the release reaches [PyPI](https://pypi.org/project/its-compiler/), while all other dependencies resolve from PyPI.

```bash
cd server
uv run fastapi dev app.py --port 8402
```

The first run creates the environment and installs everything; subsequent runs start immediately. `fastapi dev` serves with auto-reload; use `uv run fastapi run app.py --port 8402` for a production-style server.

The demo's Server compile option talks to this service through the Vite dev proxy at `/its-api`, so no cross-origin requests are involved during development. For direct access from other origins, CORS is an allowlist covering the Pages origin plus localhost dev origins, configurable via `ITS_CORS_ORIGINS`.

## Endpoints

| Method | Path      | Body                                    | Returns                          |
| ------ | --------- | --------------------------------------- | -------------------------------- |
| POST   | /compile  | `{"template": {...}, "variables": {}}`  | `{ok, prompt, warnings, error, compiler}` |
| POST   | /validate | `{"template": {...}}`                   | `{ok, warnings, error}`         |
| GET    | /health   |                                          | `{"status": "ok"}`              |

Notes:

- The `/compile` response also carries `"compiler": "its-compiler (python)"` so the demo can report which engine produced the prompt.
- Templates using `extends` fetch schemas over HTTPS from the server process, so it needs outbound network access.

## Deployment

The service runs as the Railway service `compile-server`, configured by `server/railway.json` (uv start command, `/health` health check). To redeploy after changing the server, run from `server/`:

```bash
railway up --service compile-server --ci
```

The production URL is https://compile-server-production-529e.up.railway.app. Environment variables on the service:

- `ITS_INTERACTIVE_ALLOWLIST=false`: the compiler never prompts on the headless server.
- `ITS_MAX_VARIABLE_COUNT=50000`, `ITS_MAX_VARIABLE_ARRAY_ITEMS=10000`, `ITS_MAX_TEXT_LENGTH=50000`: raised processing limits so large reference datasets compile.
- `ITS_CORS_ORIGINS` (optional): comma-separated allowed origins, overriding the default allowlist in `app.py`.

A sibling .NET service (`compile-server-dotnet`) serves the same contract, deployed from the [its-compiler-dotnet](https://github.com/AlexanderParker/its-compiler-dotnet) repository.

## Abuse protection

A deployed instance is a public endpoint that costs its operator compute and
egress. CORS does not protect it: browsers enforce CORS, anything else ignores
it, and the demo is a static site so it cannot hold a secret to send either.

Requests are throttled per client address over two windows, and the body is
capped before it is read.

| Variable | Default | Purpose |
| --- | --- | --- |
| `ITS_RATE_LIMIT_PER_MINUTE` | 30 | Burst limit. `0` disables this window. |
| `ITS_RATE_LIMIT_PER_HOUR` | 300 | Catches sustained scraping that stays under the burst limit. `0` disables. |
| `ITS_RATE_LIMIT_MAX_TRACKED` | 10000 | Addresses held before a sweep, so the table cannot grow without bound. |
| `ITS_MAX_REQUEST_BYTES` | 524288 | Largest accepted body. Rejected with 413. |

Setting both limits to `0` turns throttling off for a private deployment.

The client address is the rightmost `X-Forwarded-For` entry. The leftmost is
set by the caller, and rotating a fake value would otherwise lift the limit
entirely. `/health` is never throttled, so a platform probe cannot trip it.

A refused request does not count against the caller, so a client retrying in a
loop still recovers when its window expires.
