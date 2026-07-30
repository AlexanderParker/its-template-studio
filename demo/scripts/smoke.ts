import { compile } from "its-compiler-js";
import { inlineBundledLibraries } from "../src/compiler/browser";
import { sampleDatasets } from "../src/data/sampleDatasets";
import { sampleTemplates } from "../src/data/sampleTemplates";

async function main(): Promise<void> {
  let failures = 0;
  for (const sample of sampleTemplates) {
    const datasets = sampleDatasets.filter(
      (d) => d.templateIds.length === 0 || d.templateIds.includes(sample.id),
    );
    for (const dataset of datasets) {
      const template = inlineBundledLibraries(sample.template);
      try {
        const result = await compile(template, dataset.variables);
        const hasPlaceholders = result.prompt.includes("<<");
        if (sample.id === "weekly-forecast") {
          // Data-driven sample: the dataset must appear once as reference
          // data above the template, never in the template body
          if (!result.prompt.includes("REFERENCE DATA") || !result.prompt.includes("### forecast")) {
            throw new Error("weekly-forecast prompt is missing the reference data section");
          }
          const templateSection = result.prompt.slice(result.prompt.indexOf("TEMPLATE"));
          if (/\|\s*day\s*\|/.test(templateSection)) {
            throw new Error("weekly-forecast template section leaks the reference data table");
          }
        }
        if (sample.id === "api-response") {
          // One-shot JSON sample: the TEMPLATE section must be exactly the
          // JSON document scaffolding, nothing before or after it.
          const templateSection = result.prompt.slice(result.prompt.indexOf("TEMPLATE") + "TEMPLATE".length).trim();
          if (!templateSection.startsWith("{") || !templateSection.endsWith("}")) {
            throw new Error("api-response template section is not a bare JSON document");
          }
        }
        console.log(
          `PASS ${sample.id} × ${dataset.id} (${result.prompt.length} chars, placeholders: ${hasPlaceholders})`,
        );
      } catch (error) {
        failures += 1;
        console.error(`FAIL ${sample.id} × ${dataset.id}:`, error instanceof Error ? error.message : error);
      }
    }
  }
  if (failures > 0) process.exit(1);
}

void main();
