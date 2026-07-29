import { compile } from "its-compiler-js";
import type { InstructionTypeDefinition, ItsTemplate, JsonValue } from "its-template-editor";
import { STANDARD_TYPES_URL } from "../data/instructionTypes";
import bundledStandardTypes from "../data/standard-types.json";

export interface CompileOutcome {
  ok: boolean;
  prompt?: string;
  warnings: string[];
  error?: string;
  durationMs: number;
  engine: "browser" | "server";
}

interface TypeExtensionSchema {
  instructionTypes?: Record<string, InstructionTypeDefinition>;
}

/**
 * Replaces the standard-types extends reference with inline custom
 * instruction types from the bundled schema. Used when remote schema
 * resolution is unavailable or disabled.
 */
export function inlineStandardTypes(template: ItsTemplate): ItsTemplate {
  const remaining = (template.extends ?? []).filter((url) => url !== STANDARD_TYPES_URL);
  const referencesStandardTypes = (template.extends ?? []).length !== remaining.length;
  if (!referencesStandardTypes) return template;

  const standardTypes = (bundledStandardTypes as TypeExtensionSchema).instructionTypes ?? {};
  const next: ItsTemplate = {
    ...template,
    customInstructionTypes: {
      ...standardTypes,
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
  const input = options.inlineTypes ? inlineStandardTypes(template) : template;
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
