// Browser shim for Node's url module. The compiler imports the URL class,
// which browsers provide natively, and fileURLToPath, which only the local
// file schema path uses (never reachable in the browser).
export const URL = globalThis.URL;

export function fileURLToPath(input: string | InstanceType<typeof globalThis.URL>): string {
  const text = typeof input === "string" ? input : input.href;
  return text.replace(/^file:\/\//, "");
}

export function pathToFileURL(input: string): InstanceType<typeof globalThis.URL> {
  return new globalThis.URL(`file://${input.replace(/\\/g, "/")}`);
}

export default { URL: globalThis.URL, fileURLToPath, pathToFileURL };
