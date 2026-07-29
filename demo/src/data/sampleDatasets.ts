import type { JsonValue } from "its-template-editor";

export interface SampleDataset {
  id: string;
  label: string;
  /** Template ids this dataset is designed for; empty means any template. */
  templateIds: string[];
  variables: Record<string, JsonValue>;
}

export const sampleDatasets: SampleDataset[] = [
  {
    id: "none",
    label: "Template defaults (no overrides)",
    templateIds: [],
    variables: {},
  },
  {
    id: "headset",
    label: "Gaming headset (AuralTech)",
    templateIds: ["product-launch"],
    variables: {
      product: { name: "wireless gaming headset", brand: "AuralTech" },
      featureCount: 5,
      includeSpecs: true,
      tone: "enthusiastic",
    },
  },
  {
    id: "espresso",
    label: "Espresso machine (Barista Uno)",
    templateIds: ["product-launch"],
    variables: {
      product: { name: "dual-boiler espresso machine", brand: "Barista Uno" },
      featureCount: 4,
      includeSpecs: true,
      tone: "professional",
    },
  },
  {
    id: "ebike",
    label: "Commuter e-bike, no specs table",
    templateIds: ["product-launch"],
    variables: {
      product: { name: "folding commuter e-bike", brand: "Swift Cycles" },
      featureCount: 6,
      includeSpecs: false,
      tone: "friendly",
    },
  },
  {
    id: "vector-db-technical",
    label: "Vector databases, technical audience",
    templateIds: ["blog-post"],
    variables: {
      topic: "vector databases",
      audienceLevel: "technical",
      codeLanguage: "python",
    },
  },
  {
    id: "composting-general",
    label: "Home composting, general audience",
    templateIds: ["blog-post"],
    variables: {
      topic: "home composting",
      audienceLevel: "general",
      codeLanguage: "generic",
    },
  },
  {
    id: "python-cli",
    label: "Python CLI project",
    templateIds: ["project-readme"],
    variables: {
      project: { name: "csv-wrangler", homepage: "https://example.com/csv-wrangler" },
      language: "python",
      includeQuickStart: true,
    },
  },
  {
    id: "ts-library",
    label: "TypeScript library, no quick start",
    templateIds: ["project-readme"],
    variables: {
      project: { name: "schema-forge", homepage: "https://example.com/schema-forge" },
      language: "typescript",
      includeQuickStart: false,
    },
  },
];

export function datasetsForTemplate(templateId: string | null): SampleDataset[] {
  return sampleDatasets.filter(
    (dataset) => dataset.templateIds.length === 0 || (templateId !== null && dataset.templateIds.includes(templateId)),
  );
}
