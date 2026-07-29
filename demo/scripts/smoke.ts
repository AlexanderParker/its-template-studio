import { compile } from "its-compiler-js";
import { inlineStandardTypes } from "../src/compiler/browser";
import { sampleDatasets } from "../src/data/sampleDatasets";
import { sampleTemplates } from "../src/data/sampleTemplates";

async function main(): Promise<void> {
  let failures = 0;
  for (const sample of sampleTemplates) {
    const datasets = sampleDatasets.filter(
      (d) => d.templateIds.length === 0 || d.templateIds.includes(sample.id),
    );
    for (const dataset of datasets) {
      const template = inlineStandardTypes(sample.template);
      try {
        const result = await compile(template, dataset.variables);
        const hasPlaceholders = result.prompt.includes("<<");
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
