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
  /** Types per library id, so the palette can be scoped to a template's extends. */
  perLibraryTypes: Record<string, Record<string, InstructionTypeDefinition>>;
  /** Overall source: live only if every library loaded live. */
  source: "live" | "bundled" | "mixed";
  perLibrary: Record<string, "live" | "bundled">;
}

/**
 * Whether a template's extends list names this library. Matches the
 * published URL exactly, or any entry ending with the library's filename so
 * relative and locally mirrored extends still scope the palette correctly.
 */
export function libraryMatchesExtends(library: TypeLibrary, extendsList: string[]): boolean {
  const filename = library.url.slice(library.url.lastIndexOf("/") + 1);
  return extendsList.some(
    (entry) => entry === library.url || entry === filename || entry.endsWith(`/${filename}`),
  );
}

/**
 * The palette for a template: only types from libraries the template
 * extends. Types from the template's own customInstructionTypes are merged
 * by the editor itself, so a template extending nothing still offers its
 * custom types.
 */
export function paletteForExtends(
  loaded: LoadedInstructionTypes | null,
  extendsList: string[] | undefined,
): Record<string, InstructionTypeDefinition> {
  if (loaded === null) return {};
  const list = extendsList ?? [];
  const types: Record<string, InstructionTypeDefinition> = {};
  for (const library of TYPE_LIBRARIES) {
    if (libraryMatchesExtends(library, list)) {
      Object.assign(types, loaded.perLibraryTypes[library.id] ?? {});
    }
  }
  return types;
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

  const perLibraryTypes: Record<string, Record<string, InstructionTypeDefinition>> = {};
  const perLibrary: Record<string, "live" | "bundled"> = {};
  results.forEach((result, index) => {
    perLibraryTypes[TYPE_LIBRARIES[index].id] = result.types;
    perLibrary[TYPE_LIBRARIES[index].id] = result.source;
  });

  const sources = new Set(Object.values(perLibrary));
  const source = sources.size === 1 ? [...sources][0] : "mixed";
  return { perLibraryTypes, source, perLibrary };
}
