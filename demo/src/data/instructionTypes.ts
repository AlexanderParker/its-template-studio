import type { InstructionTypeDefinition } from "its-template-editor";
import bundledStandardTypes from "./standard-types.json";

export const STANDARD_TYPES_URL =
  "https://alexanderparker.github.io/instruction-template-specification/schema/v1.0/its-standard-types-v1.json";

export const BASE_SCHEMA_URL =
  "https://alexanderparker.github.io/instruction-template-specification/schema/v1.0/its-base-schema-v1.json";

interface TypeExtensionSchema {
  instructionTypes?: Record<string, InstructionTypeDefinition>;
}

/**
 * Loads the standard instruction types for the editor palette. The live
 * schema is preferred so the palette matches whatever the compiler will
 * resolve at compile time; the bundled copy is the offline fallback.
 */
export async function loadStandardTypes(): Promise<{
  types: Record<string, InstructionTypeDefinition>;
  source: "live" | "bundled";
}> {
  try {
    const response = await fetch(STANDARD_TYPES_URL, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const schema = (await response.json()) as TypeExtensionSchema;
      if (schema.instructionTypes && Object.keys(schema.instructionTypes).length > 0) {
        return { types: schema.instructionTypes, source: "live" };
      }
    }
  } catch {
    // Fall through to the bundled copy.
  }
  return {
    types: (bundledStandardTypes as TypeExtensionSchema).instructionTypes ?? {},
    source: "bundled",
  };
}
