# its-template-editor

A WYSIWYG React component for building [Instruction Template Specification (ITS)](https://alexanderparker.github.io/instruction-template-specification/) templates. The editor is fully decoupled from any compiler implementation: it edits plain template objects and has no runtime dependencies beyond React.

## Installation

This directory is a working mirror of the standalone [its-wysiwyg-common](https://github.com/AlexanderParker/its-wysiwyg-common) repository. Within this repository it is consumed directly from source by the demo; publishing happens from its-wysiwyg-common via its release workflow, so do not publish from here.

## Usage

```tsx
import { useState } from "react";
import { TemplateEditor, type ItsTemplate } from "its-template-editor";
import "its-template-editor/styles.css";

const initial: ItsTemplate = {
  version: "1.0.0",
  content: [{ type: "text", text: "Hello ${name}" }],
  variables: { name: "world" },
};

export function MyApp() {
  const [template, setTemplate] = useState(initial);
  return <TemplateEditor value={template} onChange={setTemplate} instructionTypes={myTypes} />;
}
```

## Props

| Prop               | Type                                          | Description                                                                                     |
| ------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `value`            | `ItsTemplate`                                 | The template being edited. The component is fully controlled.                                   |
| `onChange`         | `(template: ItsTemplate) => void`             | Called with a new template object on every edit.                                                |
| `instructionTypes` | `Record<string, InstructionTypeDefinition>`   | Optional (defaults to `{}`). Types shown in the placeholder palette, e.g. the ITS standard types. Template-level `customInstructionTypes` are merged on top automatically. |
| `showJsonTab`      | `boolean`                                     | Show the built-in JSON source tab, labelled "JSON" (default `true`).                            |
| `className`        | `string`                                      | Extra class on the editor root.                                                                 |

## Features

- Document-flow Content tab: text, placeholder and conditional elements (including nested conditionals with else branches) lay out in document flow mirroring the compiled template - flowing monospace text, inline placeholder tokens matching the `<<...>>` markers with per-placeholder settings in a modal (gear icon), and a Metadata tab whose extends entries are per-schema selects fed by the host's schemaOptions prop (known libraries or a custom URL), and if/else conditional rails. Single-line text and placeholder tokens flow alongside each other on the same row until a Line break block (a text element holding a literal newline, shown as a compact chip), so the layout matches the compiled line structure, with a dashed rule extending each line break across the row; each block carries an actions icon that opens on click or tap (inside the token for placeholders, next to the settings gear) with move, insert before, insert after, duplicate and delete; the add-block panel opens at the exact position the new block will occupy
- Interactive JSON structure builder: add a JSON object or array block, then add properties and items through the UI, each a fixed value, a generated fill (string, number or any value) or a nested object or array, to any depth; arrays and objects also take generated-run entries (`json_array_items`, `json_object_fields`). The structure serialises to ordinary ITS text and placeholder elements, so templates stay spec-compliant, and a template containing only a JSON structure compiles to a prompt whose one-shot response is the completed raw JSON document and nothing else. The add menu offers the JSON structure option only when the palette provides the five JSON builder types (`JSON_STRUCTURE_TYPES`, exported from `jsonStructure.ts`)
- Config forms generated from each instruction type's `configSchema` (enums, integers, booleans, strings), plus data sources and data limit fields writing the reserved `dataSource` and `dataLimit` config keys: referenced variables are rendered by compilers as a REFERENCE DATA section above the template (context the model uses but never outputs), capped at the limit with the most generous request winning across placeholders (requires its-compiler-js 1.3.0 or its-compiler 1.2.0)
- Variables panel with JSON-aware value parsing and unused-variable hints
- Right-click variable insertion: text blocks, descriptions, config values and JSON builder fields offer an expandable tree of the template's variables - object properties, array indices, `.length` and collection function submenus (`concat`/`sum`/`avg`/`min`/`max` by property, `top` with count choices, requiring compilers with collection function support) - inserting `${path}` at the caret; condition fields insert the bare path and omit functions to match expression syntax; numeric config fields use an integer-filtered mode offering only integer-producing paths and functions
- Typed fixed values in the JSON builder: fixed strings are typed without quotes, fixed numbers use a numeric input, fixed booleans a true/false select and fixed null is a single choice, so JSON syntax knowledge is never required
- Custom instruction types panel: define template strings and config schemas (enums, defaults, integers, booleans) directly in the studio; new types appear in the placeholder palette immediately and renames update every placeholder that references them
- Metadata panel covering name, description, author, version and `extends` schema references
- Two-way JSON source view (the "JSON" tab) with validation before applying
- Themeable through CSS custom properties (see the `--its-*` variables in `styles.css`); all selectors are scoped under `.its-editor`

## Design notes

The component never fetches schemas, never compiles and never touches the network. Supplying instruction type definitions (for example by fetching the ITS standard types schema) is the host application's responsibility, which keeps the editor usable in offline and server-rendered contexts.
