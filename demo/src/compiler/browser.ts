import { compile } from "its-compiler-js";
import type { InstructionTypeDefinition, ItsTemplate, JsonValue } from "its-template-editor";
import { TYPE_LIBRARIES } from "../data/instructionTypes";

export interface CompileOutcome {
  ok: boolean;
  prompt?: string;
  warnings: string[];
  error?: string;
  durationMs: number;
  engine: "browser" | "server" | "dotnet";
}

/**
 * Replaces extends references to any bundled type library with inline
 * custom instruction types from the bundled copies. Used when remote
 * schema resolution is unavailable or disabled. Libraries are inlined in
 * the template's extends order so override precedence is preserved;
 * unrecognised extends URLs are left in place.
 */
export function inlineBundledLibraries(template: ItsTemplate): ItsTemplate {
  const extendsList = template.extends ?? [];
  const bundledByUrl = new Map(TYPE_LIBRARIES.map((library) => [library.url, library.bundled]));

  const inlined: Record<string, InstructionTypeDefinition> = {};
  const remaining: string[] = [];
  let replacedAny = false;

  for (const url of extendsList) {
    const bundled = bundledByUrl.get(url);
    if (bundled) {
      Object.assign(inlined, bundled.instructionTypes ?? {});
      replacedAny = true;
    } else {
      remaining.push(url);
    }
  }
  if (!replacedAny) return template;

  const next: ItsTemplate = {
    ...template,
    customInstructionTypes: {
      ...inlined,
      ...(template.customInstructionTypes ?? {}),
    },
  };
  if (remaining.length > 0) {
    next.extends = remaining;
  } else {
    delete next.extends;
  }
  return next;
}

export async function compileInBrowser(
  template: ItsTemplate,
  variables: Record<string, JsonValue>,
  options: { inlineTypes: boolean },
): Promise<CompileOutcome> {
  const started = performance.now();
  const input = options.inlineTypes ? inlineBundledLibraries(template) : template;
  try {
    const result = await compile(input, variables);
    return {
      ok: true,
      prompt: result.prompt,
      warnings: result.warnings ?? [],
      durationMs: performance.now() - started,
      engine: "browser",
    };
  } catch (error) {
    return {
      ok: false,
      warnings: [],
      error: error instanceof Error ? error.message : String(error),
      durationMs: performance.now() - started,
      engine: "browser",
    };
  }
}
