/**
 * Browser stub for node:path. Only compileFile() reaches path (deriving a
 * base URL from a filesystem path), which the demo never calls; minimal
 * implementations keep the bundle valid.
 */

export function dirname(input: string): string {
  const index = Math.max(input.lastIndexOf("/"), input.lastIndexOf("\\"));
  return index > 0 ? input.slice(0, index) : input;
}

export function resolve(...parts: string[]): string {
  return parts.join("/");
}

export default { dirname, resolve };
