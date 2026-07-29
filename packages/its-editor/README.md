# its-template-editor

A WYSIWYG React component for building [Instruction Template Specification (ITS)](https://alexanderparker.github.io/instruction-template-specification/) templates. The editor is fully decoupled from any compiler implementation: it edits plain template objects and has no runtime dependencies beyond React.

## Installation

The package is not yet published. Within this repository it is consumed directly from source by the demo; to publish, run `npm run build` in this directory and `npm publish` the resulting package.

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
| `instructionTypes` | `Record<string, InstructionTypeDefinition>`   | Types shown in the placeholder palette, e.g. the ITS standard types. Template-level `customInstructionTypes` are merged on top automatically. |
| `showJsonTab`      | `boolean`                                     | Show the built-in JSON source tab (default `true`).                                             |
| `className`        | `string`                                      | Extra class on the editor root.                                                                 |

## Features

- Block-based editing of text, placeholder and conditional elements, including nested conditionals with else branches
- Config forms generated from each instruction type's `configSchema` (enums, integers, booleans, strings)
- Variables panel with JSON-aware value parsing and unused-variable hints
- Custom instruction types panel: define template strings and config schemas (enums, defaults, integers, booleans) directly in the studio; new types appear in the placeholder palette immediately and renames update every placeholder that references them
- Metadata panel covering name, description, author, version and `extends` schema references
- Two-way JSON source view with validation before applying
- Themeable through CSS custom properties (see the `--its-*` variables in `styles.css`); all selectors are scoped under `.its-editor`

## Design notes

The component never fetches schemas, never compiles and never touches the network. Supplying instruction type definitions (for example by fetching the ITS standard types schema) is the host application's responsibility, which keeps the editor usable in offline and server-rendered contexts.
