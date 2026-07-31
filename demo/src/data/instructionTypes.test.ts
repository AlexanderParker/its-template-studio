import { describe, expect, it } from "vitest";
import type { InstructionTypeDefinition } from "its-template-editor";
import {
  JSON_TYPES_URL,
  STANDARD_TYPES_URL,
  libraryMatchesExtends,
  paletteForExtends,
  TYPE_LIBRARIES,
  type LoadedInstructionTypes,
} from "./instructionTypes";

const definition = (description: string): InstructionTypeDefinition => ({
  template: "<<([{<{description}>}])>>",
  description,
});

const loaded: LoadedInstructionTypes = {
  perLibraryTypes: {
    standard: { paragraph: definition("standard") },
    json: { json_string: definition("json") },
    html: { html_text: definition("html") },
    yaml: { yaml_value: definition("yaml") },
  },
  source: "bundled",
  perLibrary: { standard: "bundled", json: "bundled", html: "bundled", yaml: "bundled" },
};

describe("paletteForExtends", () => {
  it("scopes the palette to the libraries the template extends", () => {
    const palette = paletteForExtends(loaded, [STANDARD_TYPES_URL]);

    expect(Object.keys(palette)).toEqual(["paragraph"]);
  });

  it("merges every extended library", () => {
    const palette = paletteForExtends(loaded, [STANDARD_TYPES_URL, JSON_TYPES_URL]);

    expect(Object.keys(palette).sort()).toEqual(["json_string", "paragraph"]);
  });

  it("offers nothing when the template extends nothing", () => {
    expect(paletteForExtends(loaded, undefined)).toEqual({});
    expect(paletteForExtends(loaded, [])).toEqual({});
  });

  it("returns an empty palette before the libraries load", () => {
    expect(paletteForExtends(null, [STANDARD_TYPES_URL])).toEqual({});
  });

  it("matches relative and mirrored extends by filename", () => {
    const standard = TYPE_LIBRARIES.find((library) => library.id === "standard")!;

    expect(libraryMatchesExtends(standard, ["./schemas/its-standard-types-v1.json"])).toBe(true);
    expect(libraryMatchesExtends(standard, ["its-standard-types-v1.json"])).toBe(true);
    expect(libraryMatchesExtends(standard, ["https://example.com/other-types.json"])).toBe(false);
  });
});
