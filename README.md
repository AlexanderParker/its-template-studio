# ITS Template Studio

A WYSIWYG editor and compile playground for the [Instruction Template Specification (ITS)](https://alexanderparker.github.io/instruction-template-specification/). Build templates visually, inject sample variable datasets, and compile them to AI prompts through three engines: [its-compiler-js](https://github.com/alexanderparker/its-compiler-js) in the browser, the Python [its-compiler](https://pypi.org/project/its-compiler/) service, or the .NET [InstructionTemplateSpecification.Compiler](https://github.com/AlexanderParker/its-compiler-dotnet) service.

**Live demo:** https://alexanderparker.github.io/its-template-studio/

## Repository layout

```
demo/                  Vite + React demo app driving all three engines (samples, import/export)
server/                FastAPI service wrapping the Python reference compiler
```

The .NET compile service lives in the [its-compiler-dotnet](https://github.com/AlexanderParker/its-compiler-dotnet) repository.

## Quick start

Requires Node 18+.

```bash
npm install
npm run dev
```

Open the printed URL. The browser engine works immediately; the server engines need their services running: the Python service locally on port 8402 (see below) and the .NET service on port 8404 (`dotnet run --project samples/InstructionTemplateSpecification.Compiler.Service` in its-compiler-dotnet).

## Demo features

- **WYSIWYG editing** across five tabs: Content, Variables, Custom types, Metadata and a two-way JSON source view.
- **Document-flow Content tab**: blocks lay out in document flow mirroring the compiled template - flowing monospace text, inline placeholder tokens matching the `<<...>>` markers with per-placeholder settings in a modal (gear icon), and if/else conditional rails.
- **Schema-scoped palette**: the demo derives the placeholder palette from the template's `extends` references (`paletteForExtends` in `demo/src/data/instructionTypes.ts`), so only types from the libraries a template extends are offered; the editor's add menu hides the JSON structure option unless the palette provides the five JSON builder types.
- **All published type libraries bundled**: the standard (prose) types plus the JSON, HTML and YAML structured-output libraries, fetched live with bundled fallbacks merged in a stable order.
- **Right-click variable insertion**: an expandable tree of the template's variable paths (object properties, array indices, `.length`), collection-function submenus (`concat`/`sum`/`avg`/`min`/`max`/`top`), bare paths in condition fields, and an integer-filtered mode for numeric config fields.
- **JSON structure builder**: build a JSON response interactively - nested objects, arrays, typed fixed values including null, and generated fills - and compile to a prompt whose one-shot response is the completed raw JSON document and nothing else (see the "One-shot JSON response" sample).
- **Placeholder data sources**: placeholders reference datasets by name through the `dataSource` and `dataLimit` config keys, rendered by all three compilers as a REFERENCE DATA section above the template that the model uses but never outputs; object-valued `${refs}` also render as reference data. Requires its-compiler-js 1.3.0 and its-compiler 1.2.0. its-compiler-js 1.3.0 is on npm and resolved from the registry; the Python engine still pins its compiler from git in `server/pyproject.toml` until its-compiler 1.2.0 is published to PyPI.
- **Nine sample templates**, each with injectable datasets: product launch copy, blog post brief, project README, weekly forecast summary, school improvement plan, one-shot JSON response, CI pipeline config, product card fragment and Markdown release notes.
- **Schema selects in the Metadata tab**: each `extends` entry is a per-schema row choosing from the published libraries (standard, JSON, HTML, YAML, Markdown) or a custom URL field.
- **Auto-compile**: with the browser engine, an option recompiles the prompt automatically a moment after every template change.
- **Import / export**: templates round-trip as standard ITS JSON files.
- **Three compile engines**:
  - Browser: `its-compiler-js` bundled into the page. Remote `extends` schemas resolve over HTTPS from the browser; an "inline bundled type libraries" option substitutes bundled copies of any referenced library for offline use.
  - Server (Python): POSTs the template and variables through the dev proxy to the FastAPI service, which compiles with the Python reference implementation.
  - Server (.NET): the same contract served by `InstructionTemplateSpecification.Compiler.Service` from [its-compiler-dotnet](https://github.com/AlexanderParker/its-compiler-dotnet); in development the dev proxy forwards `/its-dotnet-api` to a local instance on port 8404 (`dotnet run --project samples/InstructionTemplateSpecification.Compiler.Service`).

## Server-side compiler

Requires [uv](https://docs.astral.sh/uv/).

```bash
cd server
uv run fastapi dev app.py --port 8402
```

uv creates the environment and installs dependencies from `pyproject.toml` on first run, resolving its-compiler from PyPI. Then choose the Server engine in the demo; requests route through the Vite dev proxy (`/its-api`), so no cross-origin requests are involved. See `server/README.md` for endpoint details.

## The editor as a standalone component

The editor is [`its-template-editor`](https://www.npmjs.com/package/its-template-editor), a controlled React component with no compiler and no network access, published from [its-wysiwyg-common](https://github.com/AlexanderParker/its-wysiwyg-common). The demo consumes it from the registry like any other dependency; there is no local copy to keep in sync.

### Working on the editor and the demo together

To try an unreleased editor change without publishing, link the two checkouts:

```bash
# in its-wysiwyg-common
npm run build
npm link

# in its-template-studio
npm link its-template-editor --workspace demo
npm run dev
```

Rebuild the editor after each change; Vite picks up the new output. To go back to the published version:

```bash
npm unlink its-template-editor --workspace demo
npm install
```

## How the browser build works

`its-compiler-js` (minimum 1.3.0) targets Node and imports `fs`, `path`, `url` and `node-fetch` at module scope. The demo aliases these four modules to thin shims (`demo/src/stubs/`): `url` re-exports the native `URL`, `path` provides minimal implementations, `node-fetch` delegates to native `fetch`, and `fs` throws if touched, which only happens via `compileFile()`, never used by the demo. Everything else in the compiler (validation, variable processing, jsep-based conditional evaluation, schema loading over HTTPS) runs unmodified in the browser.

The fetch shim used to strip request headers as well, because the compiler sent `Cache-Control` on every schema fetch. That header is not CORS-safelisted, so it turned a simple GET into a preflight, which GitHub Pages answers with 405. From 1.3.0 the compiler sends it only from a Node runtime, so the shim passes the request through untouched.

## Deployment

The demo is published on GitHub Pages with the Python and .NET compile services on Railway, so all three engines work in production.

### Compile service (Railway)

Two Railway services back the server engines: `compile-server` (this Python service) and `compile-server-dotnet` (deployed from the its-compiler-dotnet repository). The `compile-server` service deploys the `server/` directory: uv-based install driven by `pyproject.toml`/`uv.lock` (its-compiler resolves from git until the release reaches PyPI), configured by `server/railway.json` (start command `uv run fastapi run app.py --port $PORT`, health check `/health`). To redeploy after changing the server:

```bash
cd server
railway up --service compile-server --ci -m "describe the change"
```

Environment variables on the service:

- `ITS_CORS_ORIGINS` (optional): comma-separated allowed origins. The default in `app.py` covers the Pages origin (`https://alexanderparker.github.io`) and localhost dev ports. The demo's compile request is a JSON POST, which triggers a CORS preflight; the middleware answers the OPTIONS request.
- `ITS_INTERACTIVE_ALLOWLIST=false`: the compiler never prompts on the headless server (the published schema URLs are trusted by its built-in patterns regardless).
- `ITS_MAX_VARIABLE_COUNT=50000`, `ITS_MAX_VARIABLE_ARRAY_ITEMS=10000`, `ITS_MAX_TEXT_LENGTH=50000`: raised processing limits so large reference datasets compile; all compiler limits are operator-configurable.

### Demo (GitHub Pages)

`.github/workflows/deploy-pages.yml` builds the demo on every push to main, runs the smoke script as a gate, and deploys `demo/dist` to Pages (Actions source). The build reads both repository variables `VITE_ITS_API_URL` (the Python service URL, currently `https://compile-server-production-529e.up.railway.app`) and `VITE_ITS_DOTNET_API_URL`; they are baked into the bundle as the production server-engine URLs. Locally the values are unset and the dev proxies (`/its-api`, `/its-dotnet-api`) are used instead. Vite's `base` is `/its-template-studio/` in production builds so assets resolve on the project Pages path.

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
| `npm run typecheck`    | Strict TypeScript checks                                      |
| `npm test -w demo`     | Run the demo's vitest unit suite (palette scoping)            |
| `npm run smoke -w demo`| Compile every sample template with every applicable dataset   |
| `npm run preview -w demo` | Serve the production build locally                         |
| `npm run check:schemas -w demo` | Verify bundled type library copies are byte-identical to the published files (needs network) |

## ITS ecosystem

- [Specification](https://alexanderparker.github.io/instruction-template-specification/) - the ITS spec, schemas and documentation ([source](https://github.com/AlexanderParker/instruction-template-specification))
- [its-template-editor](https://github.com/AlexanderParker/its-wysiwyg-common) - the WYSIWYG React editor component behind the studio
- [its-compiler-js](https://github.com/AlexanderParker/its-compiler-js) - JavaScript/TypeScript reference compiler ([npm](https://www.npmjs.com/package/its-compiler-js))
- [its-compiler-python](https://github.com/AlexanderParker/its-compiler-python) - Python reference compiler library ([PyPI](https://pypi.org/project/its-compiler/))
- [its-compiler-dotnet](https://github.com/AlexanderParker/its-compiler-dotnet) - .NET compiler with an Azure Functions sample ([NuGet](https://www.nuget.org/packages/InstructionTemplateSpecification.Compiler))
- [its-compiler-cli](https://github.com/AlexanderParker/its-compiler-cli-python) - command-line interface for the Python compiler ([PyPI](https://pypi.org/project/its-compiler-cli/))
- [its-example-templates](https://github.com/AlexanderParker/its-example-templates) - example and test templates exercising the published schemas

## Trademarks

Third-party names are used only to describe interoperability, and no
affiliation or endorsement is implied. Azure is a trademark of Microsoft
Corporation. GitHub is a trademark of GitHub, Inc. Railway is a trademark of
Railway Corp. All other trademarks are the property of their respective
owners.
