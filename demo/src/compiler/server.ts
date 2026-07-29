import type { ItsTemplate, JsonValue } from "its-template-editor";
import type { CompileOutcome } from "./browser";

interface ServerCompileResponse {
  ok: boolean;
  prompt?: string;
  warnings?: string[];
  error?: string;
  compiler?: string;
}

// The dev server proxies /its-api to the Python service (see vite.config.ts),
// keeping requests same-origin. An absolute URL also works when the service
// is reached directly, as its CORS middleware permits cross-origin requests.
export const DEFAULT_SERVER_URL = "/its-api";

export async function compileOnServer(
  serverUrl: string,
  template: ItsTemplate,
  variables: Record<string, JsonValue>,
): Promise<CompileOutcome> {
  const started = performance.now();
  try {
    const response = await fetch(`${serverUrl.replace(/\/$/, "")}/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, variables }),
      signal: AbortSignal.timeout(30_000),
    });
    const body = (await response.json()) as ServerCompileResponse;
    if (!response.ok || !body.ok) {
      return {
        ok: false,
        warnings: body.warnings ?? [],
        error: body.error ?? `Server responded with HTTP ${response.status}`,
        durationMs: performance.now() - started,
        engine: "server",
      };
    }
    return {
      ok: true,
      prompt: body.prompt,
      warnings: body.warnings ?? [],
      durationMs: performance.now() - started,
      engine: "server",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      warnings: [],
      error: `Could not reach the compile server at ${serverUrl}: ${message}. Start it with: uv run fastapi dev app.py --port 8402 (see server/README.md).`,
      durationMs: performance.now() - started,
      engine: "server",
    };
  }
}
