import type { ItsTemplate, JsonValue } from "its-template-editor";
import type { CompileOutcome } from "./browser";

interface ServerCompileResponse {
  ok: boolean;
  prompt?: string;
  warnings?: string[];
  error?: string;
  compiler?: string;
}

// In development the dev server proxies /its-api to the Python service (see
// vite.config.ts), keeping requests same-origin. Production builds have no
// proxy, so VITE_ITS_API_URL supplies the absolute URL of the deployed
// compile service at build time; its CORS middleware must allow the site's
// origin.
export const DEFAULT_SERVER_URL = import.meta.env.VITE_ITS_API_URL ?? "/its-api";

// The .NET compile service exposes the same contract; in development the
// dev server proxies /its-dotnet-api to a locally running instance.
export const DEFAULT_DOTNET_URL = import.meta.env.VITE_ITS_DOTNET_API_URL ?? "/its-dotnet-api";

export async function compileOnServer(
  serverUrl: string,
  template: ItsTemplate,
  variables: Record<string, JsonValue>,
  engine: "server" | "dotnet" = "server",
): Promise<CompileOutcome> {
  const started = performance.now();
  const startHint =
    engine === "dotnet"
      ? "Start it with: dotnet run --project samples/Its.Compiler.Service (see the its-compiler-dotnet repo)."
      : "Start it with: uv run fastapi dev app.py --port 8402 (see server/README.md).";
  try {
    const response = await fetch(`${serverUrl.replace(/\/$/, "")}/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, variables }),
      signal: AbortSignal.timeout(30_000),
    });
    // The hosted services are public and throttled per address, so a busy
    // visitor sees 429 rather than a compile failure. Say what happened and
    // what to do about it, rather than surfacing a bare status code.
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After")) || 0;
      const wait = retryAfter > 0 ? ` Try again in ${retryAfter} seconds.` : "";
      return {
        ok: false,
        warnings: [],
        error:
          `The hosted ${engine === "dotnet" ? ".NET" : "Python"} compile service is rate limited.${wait}` +
          " The browser engine has no limits, and running the service locally has none either.",
        durationMs: performance.now() - started,
        engine,
      };
    }
    if (response.status === 413) {
      return {
        ok: false,
        warnings: [],
        error:
          "That template is too large for the hosted demo service. Use the browser engine, or run the service locally.",
        durationMs: performance.now() - started,
        engine,
      };
    }
    const body = (await response.json()) as ServerCompileResponse;
    if (!response.ok || !body.ok) {
      return {
        ok: false,
        warnings: body.warnings ?? [],
        error: body.error ?? `Server responded with HTTP ${response.status}`,
        durationMs: performance.now() - started,
        engine,
      };
    }
    return {
      ok: true,
      prompt: body.prompt,
      warnings: body.warnings ?? [],
      durationMs: performance.now() - started,
      engine,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      warnings: [],
      error: `Could not reach the compile server at ${serverUrl}: ${message}. ${startHint}`,
      durationMs: performance.now() - started,
      engine,
    };
  }
}
