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
  {
    id: "stormy-week",
    label: "Wellington: storm front arriving",
    templateIds: ["weekly-forecast"],
    variables: {
      location: "Wellington",
      weekOf: "9 March 2026",
      forecast: [
        { day: "Monday", high: 18, low: 12, rainChancePct: 20, windKmh: 25, condition: "partly cloudy" },
        { day: "Tuesday", high: 17, low: 11, rainChancePct: 40, windKmh: 35, condition: "increasing cloud" },
        { day: "Wednesday", high: 15, low: 10, rainChancePct: 70, windKmh: 50, condition: "rain developing" },
        { day: "Thursday", high: 13, low: 9, rainChancePct: 90, windKmh: 70, condition: "heavy rain" },
        { day: "Friday", high: 12, low: 8, rainChancePct: 95, windKmh: 85, condition: "storm" },
        { day: "Saturday", high: 13, low: 8, rainChancePct: 60, windKmh: 45, condition: "easing showers" },
        { day: "Sunday", high: 15, low: 9, rainChancePct: 30, windKmh: 30, condition: "clearing" },
      ],
    },
  },
  {
    id: "heatwave-week",
    label: "Adelaide: building heatwave",
    templateIds: ["weekly-forecast"],
    variables: {
      location: "Adelaide",
      weekOf: "16 March 2026",
      forecast: [
        { day: "Monday", high: 29, low: 18, rainChancePct: 10, windKmh: 15, condition: "sunny" },
        { day: "Tuesday", high: 32, low: 20, rainChancePct: 5, windKmh: 12, condition: "sunny" },
        { day: "Wednesday", high: 35, low: 22, rainChancePct: 0, windKmh: 10, condition: "hot and sunny" },
        { day: "Thursday", high: 38, low: 24, rainChancePct: 0, windKmh: 14, condition: "very hot" },
        { day: "Friday", high: 41, low: 26, rainChancePct: 0, windKmh: 18, condition: "extreme heat" },
        { day: "Saturday", high: 39, low: 25, rainChancePct: 10, windKmh: 25, condition: "hot, gusty change late" },
        { day: "Sunday", high: 27, low: 19, rainChancePct: 40, windKmh: 30, condition: "cool change, showers" },
      ],
    },
  },
  {
    id: "hilltop-primary",
    label: "Hilltop Primary: strong attendance, maths gap",
    templateIds: ["school-improvement"],
    variables: {
      school: { name: "Hilltop Primary School", year: "2027" },
      examResults: [
        { subject: "Mathematics", averageScore: 52, passRatePct: 63, changePct: -9 },
        { subject: "English", averageScore: 74, passRatePct: 91, changePct: 4 },
        { subject: "Science", averageScore: 69, passRatePct: 85, changePct: 2 },
        { subject: "Art", averageScore: 81, passRatePct: 96, changePct: 5 },
      ],
      attendance: [
        { term: "Term 1", attendancePct: 95, chronicAbsencePct: 3 },
        { term: "Term 2", attendancePct: 94, chronicAbsencePct: 4 },
        { term: "Term 3", attendancePct: 95, chronicAbsencePct: 3 },
        { term: "Term 4", attendancePct: 93, chronicAbsencePct: 4 },
      ],
      surveyResults: [
        { statement: "I get help when I fall behind", agreePct: 78 },
        { statement: "Maths lessons make sense to me", agreePct: 41 },
        { statement: "I feel safe at school", agreePct: 93 },
        { statement: "Lessons keep me engaged", agreePct: 75 },
      ],
    },
  },
  {
    id: "orders-api",
    label: "Orders API",
    templateIds: ["api-response"],
    variables: {
      api: { baseUrl: "https://api.example.com/v2", version: "2.4.0" },
      resource: { name: "orders", idField: "orderId" },
    },
  },
  {
    id: "invoices-api",
    label: "Invoices API",
    templateIds: ["api-response"],
    variables: {
      api: { baseUrl: "https://api.example.com/v3", version: "3.0.1" },
      resource: { name: "invoices", idField: "invoiceId" },
    },
  },
  {
    id: "node-storefront",
    label: "Node storefront with deploy stage",
    templateIds: ["ci-pipeline"],
    variables: {
      project: { name: "example-storefront", language: "node", repository: "https://git.example.com/acme/example-storefront" },
      includeDeployStage: true,
    },
  },
  {
    id: "python-billing",
    label: "Python billing service, no deploy stage",
    templateIds: ["ci-pipeline"],
    variables: {
      project: { name: "example-billing", language: "python", repository: "https://git.example.com/acme/example-billing" },
      includeDeployStage: false,
    },
  },
  {
    id: "lantern-card",
    label: "Garden lantern with specifications",
    templateIds: ["product-card"],
    variables: {
      product: { name: "Solar Garden Lantern", url: "https://www.example.com/products/solar-garden-lantern" },
      includeSpecifications: true,
      includeEnquiryForm: false,
    },
  },
  {
    id: "stove-card-enquiry",
    label: "Camping stove with enquiry form, no specs",
    templateIds: ["product-card"],
    variables: {
      product: { name: "Compact Camping Stove", url: "https://www.example.com/products/compact-camping-stove" },
      includeSpecifications: false,
      includeEnquiryForm: true,
    },
  },
];

export function datasetsForTemplate(templateId: string | null): SampleDataset[] {
  return sampleDatasets.filter(
    (dataset) => dataset.templateIds.length === 0 || (templateId !== null && dataset.templateIds.includes(templateId)),
  );
}
