/**
 * Verifies that every bundled type library copy is byte-identical to its
 * published file, so drift between the demo and the specification site is
 * caught. Requires network access; run separately from the smoke script.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STANDARD_TYPES_URL, JSON_TYPES_URL, HTML_TYPES_URL, YAML_TYPES_URL } from "../src/data/instructionTypes";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data");

const BUNDLED_FILES: Array<{ file: string; url: string }> = [
  { file: "standard-types.json", url: STANDARD_TYPES_URL },
  { file: "its-json-types-v1.json", url: JSON_TYPES_URL },
  { file: "its-html-types-v1.json", url: HTML_TYPES_URL },
  { file: "its-yaml-types-v1.json", url: YAML_TYPES_URL },
];

async function main(): Promise<void> {
  let failures = 0;

  for (const { file, url } of BUNDLED_FILES) {
    const bundled = await readFile(path.join(DATA_DIR, file), "utf-8");
    let published: string;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      published = await response.text();
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${file}: could not fetch ${url}: ${error instanceof Error ? error.message : error}`);
      continue;
    }

    if (bundled === published) {
      console.log(`PASS ${file} matches ${url}`);
    } else {
      failures += 1;
      console.error(`FAIL ${file} differs from ${url} (bundled ${bundled.length} chars, published ${published.length} chars)`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} bundled schema(s) out of sync. Copy the published files over the bundled ones.`);
    process.exit(1);
  }
  console.log("\nAll bundled schemas are byte-identical to the published files.");
}

void main();
