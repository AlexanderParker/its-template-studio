// Browser shim for Node's fs module. its-compiler-js only reads files inside
// compileFile() and local schema resolution, neither of which is used in the
// browser demo, where templates are plain objects and schemas load over HTTPS.
async function readFile(): Promise<string> {
  throw new Error("Filesystem access is not available in the browser. Use compile(templateObject) instead of compileFile().");
}

export const promises = { readFile };
export default { promises };
