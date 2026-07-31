# ITS Template Studio

A WYSIWYG editor and compile playground for the [Instruction Template Specification (ITS)](https://alexanderparker.github.io/instruction-template-specification/). Build templates visually, inject sample variable datasets, and compile them to AI prompts using either [its-compiler-js](https://github.com/alexanderparker/its-compiler-js) in the browser or the Python [its-compiler](https://pypi.org/project/its-compiler/) via a bundled API.

**Live demo:** https://alexanderparker.github.io/its-template-studio/

## Repository layout

```
packages/its-editor/   its-template-editor: a decoupled, publishable React component
demo/                  Vite + React demo app (browser-side compilation, samples, import/export)
server/                FastAPI service wrapping the Python reference compiler
```

## Quick start

Requires Node 18+.

```bash
npm install
npm run dev
```

Open the printed URL. The browser engine works immediately; the server engine needs the Python service running (see below).

## Demo features

- **WYSIWYG editing** of text blocks, instruction placeholders and conditionals (with else branches and nesting), plus variables, metadata and a two-way JSON source view.
- **JSON structure builder**: build a JSON response interactively - nested objects, arrays, fixed values and generated fills - and compile to a prompt whose one-shot response is the completed raw JSON document and nothing else (see the "One-shot JSON response" sample).
- **All published type libraries in the palette**: the standard (prose) types plus the JSON, HTML and YAML structured-output libraries, fetched live with bundled fallbacks merged in a stable order.
- **Sample templates**: product launch copy, a blog post brief and a project README on the standard types, plus three structured-output samples (API response docs with JSON types, a CI pipeline with YAML types, an HTML product card with HTML types) whose template text authors the target document's structure verbatim, with placeholders filling only the generated value positions.
- **Sample datasets**: variable sets injected at compile time, overriding template defaults exactly as a `--variables` file would with the CLI compilers. The "Weekly forecast summary" sample shows data-driven generation and the "School improvement plan" sample shows multi-source synthesis (one placeholder referencing exam results, attendance and survey datasets at once): placeholders reference datasets by name (`dataSource: "forecast"` or an array of names), the compiler renders it once as a REFERENCE DATA table above the template that the model uses but never outputs, and swapping datasets changes the generated story. Requires its-compiler-js 1.3.0 and its-compiler 1.2.0; until those reach the registries, both engines resolve the compilers from git (see package.json and server/pyproject.toml).
- **Import / export**: templates round-trip as standard ITS JSON files.
- **Three compile engines**:
  - Browser: `its-compiler-js` bundled into the page. Remote `extends` schemas resolve over HTTPS from the browser; an "inline bundled type libraries" option substitutes bundled copies of any referenced library for offline use.
  - Server (Python): POSTs the template and variables through the dev proxy to the FastAPI service, which compiles with the Python reference implementation.
  - Server (.NET): the same contract served by `Its.Compiler.Service` from [its-compiler-dotnet](https://github.com/AlexanderParker/its-compiler-dotnet); in development the dev proxy forwards `/its-dotnet-api` to a local instance on port 8404 (`dotnet run --project samples/Its.Compiler.Service`).

## Server-side compiler

Requires [uv](https://docs.astral.sh/uv/).

```bash
cd server
uv run fastapi dev app.py --port 8402
```

uv creates the environment and installs dependencies from `pyproject.toml` on first run, with its-compiler pinned to TestPyPI. Then choose the Server engine in the demo; requests route through the Vite dev proxy (`/its-api`), so no cross-origin requests are involved. See `server/README.md` for endpoint details.

## The editor as a standalone component

`packages/its-editor` contains `its-template-editor`, a controlled React component with no compiler or network dependencies; the demo consumes it from source through a Vite alias. To produce a publishable build:

```bash
npm run build:editor
```

This emits ESM, CJS, type declarations and the stylesheet to `packages/its-editor/dist`. See `packages/its-editor/README.md` for the component API.

## How the browser build works

`its-compiler-js` targets Node and imports `fs`, `url` and `node-fetch` at module scope. The demo aliases these to thin shims (`demo/src/stubs/`): `url` re-exports the native `URL`, `node-fetch` re-exports native `fetch`, and `fs` throws if touched, which only happens via `compileFile()`, never used by the demo. Everything else in the compiler (validation, variable processing, jsep-based conditional evaluation, schema loading over HTTPS) runs unmodified in the browser.

## Deployment

The demo is published on GitHub Pages with the compile service on Railway, so both engines work in production.

### Compile service (Railway)

The Railway service deploys the `server/` directory: uv-based install driven by `pyproject.toml`/`uv.lock` (its-compiler resolves from PyPI), configured by `server/railway.json` (start command `uv run fastapi run app.py --port $PORT`, health check `/health`). To redeploy after changing the server:

```bash
cd server
railway up --service compile-server --ci -m "describe the change"
```

Environment variables on the service:

- `ITS_CORS_ORIGINS` (optional): comma-separated allowed origins. The default in `app.py` covers the Pages origin (`https://alexanderparker.github.io`) and localhost dev ports. The demo's compile request is a JSON POST, which triggers a CORS preflight; the middleware answers the OPTIONS request.
- `ITS_INTERACTIVE_ALLOWLIST=false`: the compiler never prompts on the headless server (the published schema URLs are trusted by its built-in patterns regardless).
- `ITS_MAX_VARIABLE_COUNT=50000`, `ITS_MAX_VARIABLE_ARRAY_ITEMS=10000`, `ITS_MAX_TEXT_LENGTH=50000`: raised processing limits so large reference datasets compile; all compiler limits are operator-configurable.

### Demo (GitHub Pages)

`.github/workflows/deploy-pages.yml` builds the demo on every push to main and deploys `demo/dist` to Pages (Actions source). The build reads the repository variable `VITE_ITS_API_URL`, which must be set to the Railway service URL (currently `https://compile-server-production-529e.up.railway.app`); it is baked into the bundle as the production server-engine URL. Locally the value is unset and the dev proxy (`/its-api`) is used instead. Vite's `base` is `/its-template-studio/` in production builds so assets resolve on the project Pages path.

To point the site at a different compile service, update the repository variable and re-run the workflow:

```bash
gh variable set VITE_ITS_API_URL --body "https://your-service.example.com"
```

The .NET engine works the same way through `VITE_ITS_DOTNET_API_URL`, currently `https://compile-server-dotnet-production.up.railway.app` (the `compile-server-dotnet` Railway service, deployed from the its-compiler-dotnet repo's Dockerfile with `railway up --service compile-server-dotnet`).

## Scripts

| Command                | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | Start the demo dev server                                     |
| `npm run build`        | Production build of the demo                                  |
| `npm run build:editor` | Build the publishable editor package                          |
| `npm run typecheck`    | Strict TypeScript checks across all workspaces                |
| `npm run smoke -w demo`| Compile every sample template with every applicable dataset   |
| `npm run check:schemas -w demo` | Verify bundled type library copies are byte-identical to the published files (needs network) |

## ITS ecosystem

- [Specification](https://alexanderparker.github.io/instruction-template-specification/) - the ITS spec, schemas and documentation ([source](https://github.com/AlexanderParker/instruction-template-specification))
- [its-template-editor](https://github.com/AlexanderParker/its-wysiwyg-common) - the WYSIWYG React editor component behind the studio
- [its-compiler-js](https://github.com/AlexanderParker/its-compiler-js) - JavaScript/TypeScript reference compiler ([npm](https://www.npmjs.com/package/its-compiler-js))
- [its-compiler-python](https://github.com/AlexanderParker/its-compiler-python) - Python reference compiler library ([PyPI](https://pypi.org/project/its-compiler/))
- [its-compiler-dotnet](https://github.com/AlexanderParker/its-compiler-dotnet) - .NET compiler with an Azure Functions sample ([NuGet](https://www.nuget.org/packages/Its.Compiler))
- [its-compiler-cli](https://github.com/AlexanderParker/its-compiler-cli-python) - command-line interface for the Python compiler ([PyPI](https://pypi.org/project/its-compiler-cli/))
- [its-example-templates](https://github.com/AlexanderParker/its-example-templates) - example and test templates exercising the published schemas
