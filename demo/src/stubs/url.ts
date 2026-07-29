// Browser shim for Node's url module. The compiler only imports the URL
// class, which browsers provide natively.
export const URL = globalThis.URL;
export default { URL: globalThis.URL };
