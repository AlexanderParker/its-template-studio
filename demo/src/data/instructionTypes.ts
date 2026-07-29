import type { InstructionTypeDefinition } from "its-template-editor";
import bundledStandardTypes from "./standard-types.json";
import bundledJsonTypes from "./its-json-types-v1.json";
import bundledHtmlTypes from "./its-html-types-v1.json";
import bundledYamlTypes from "./its-yaml-types-v1.json";

const SCHEMA_BASE_URL = "https://alexanderparker.github.io/instruction-template-specification/schema/v1.0";

export const BASE_SCHEMA_URL = `${SCHEMA_BASE_URL}/its-base-schema-v1.json`;
export const STANDARD_TYPES_URL = `${SCHEMA_BASE_URL}/its-standard-types-v1.json`;
export const JSON_TYPES_URL = `${SCHEMA_BASE_URL}/its-json-types-v1.json`;
export const HTML_TYPES_URL = `${SCHEMA_BASE_URL}/its-html-types-v1.json`;
export const YAML_TYPES_URL = `${SCHEMA_BASE_URL}/its-yaml-types-v1.json`;

interface TypeExtensionSchema {
  instructionTypes?: Record<string, InstructionTypeDefinition>;
}

export interface TypeLibrary {
  id: string;
  label: string;
  url: string;
  bundled: TypeExtensionSchema;
}

/**
 * The published type libraries bundled with the demo, in the stable order
 * they are merged into the palette (later libraries win on name collisions,
 * though domain-prefixed names mean none occur in practice).
 */
export const TYPE_LIBRARIES: TypeLibrary[] = [
  { id: "standard", label: "Standard types", url: STANDARD_TYPES_URL, bundled: bundledStandardTypes as TypeExtensionSchema },
  { id: "json", label: "JSON types", url: JSON_TYPES_URL, bundled: bundledJsonTypes as TypeExtensionSchema },
  { id: "html", label: "HTML types", url: HTML_TYPES_URL, bundled: bundledHtmlTypes as TypeExtensionSchema },
  { id: "yaml", label: "YAML types", url: YAML_TYPES_URL, bundled: bundledYamlTypes as TypeExtensionSchema },
];

export interface LoadedInstructionTypes {
  types: Record<string, InstructionTypeDefinition>;
  /** Overall source: live only if every library loaded live. */
  source: "live" | "bundled" | "mixed";
  perLibrary: Record<string, "live" | "bundled">;
}

async function loadLibrary(library: TypeLibrary): Promise<{
  types: Record<string, InstructionTypeDefinition>;
  source: "live" | "bundled";
}> {
  try {
    const response = await fetch(library.url, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const schema = (await response.json()) as TypeExtensionSchema;
      if (schema.instructionTypes && Object.keys(schema.instructionTypes).length > 0) {
        return { types: schema.instructionTypes, source: "live" };
      }
    }
  } catch {
    // Fall through to the bundled copy.
  }
  return { types: library.bundled.instructionTypes ?? {}, source: "bundled" };
}

/**
 * Loads every bundled type library for the editor palette. Live copies are
 * preferred so the palette matches what the compiler resolves at compile
 * time; bundled copies are the offline fallback, merged in stable order.
 */
export async function loadInstructionTypes(): Promise<LoadedInstructionTypes> {
  const results = await Promise.all(TYPE_LIBRARIES.map((library) => loadLibrary(library)));

  const types: Record<string, InstructionTypeDefinition> = {};
  const perLibrary: Record<string, "live" | "bundled"> = {};
  results.forEach((result, index) => {
    Object.assign(types, result.types);
    perLibrary[TYPE_LIBRARIES[index].id] = result.source;
  });

  const sources = new Set(Object.values(perLibrary));
  const source = sources.size === 1 ? [...sources][0] : "mixed";
  return { types, source, perLibrary };
}
