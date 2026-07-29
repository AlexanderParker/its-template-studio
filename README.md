# ITS Template Studio

A WYSIWYG editor and compile playground for the [Instruction Template Specification (ITS)](https://alexanderparker.github.io/instruction-template-specification/). Build templates visually, inject sample variable datasets, and compile them to AI prompts using either [its-compiler-js](https://github.com/alexanderparker/its-compiler-js) in the browser or the Python [its-compiler](https://test.pypi.org/project/its-compiler/) via a bundled API.

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
- **Sample templates**: product launch copy, a blog post brief, and a project README, all extending the ITS standard types schema.
- **Sample datasets**: variable sets injected at compile time, overriding template defaults exactly as a `--variables` file would with the CLI compilers.
- **Import / export**: templates round-trip as standard ITS JSON files.
- **Two compile engines**:
  - Browser: `its-compiler-js` bundled into the page. Remote `extends` schemas resolve over HTTPS from the browser; an "inline standard types" option substitutes a bundled copy of the standard types for offline use.
  - Server: POSTs the template and variables through the dev proxy to the FastAPI service, which compiles with the Python reference implementation.

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

## Scripts

| Command                | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | Start the demo dev server                                     |
| `npm run build`        | Production build of the demo                                  |
| `npm run build:editor` | Build the publishable editor package                          |
| `npm run typecheck`    | Strict TypeScript checks across all workspaces                |
| `npm run smoke -w demo`| Compile every sample template with every applicable dataset   |
