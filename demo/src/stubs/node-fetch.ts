// Browser shim for node-fetch. The compiler imports node-fetch at module
// scope, so the bundler needs something to resolve it to; the native fetch is
// used for remote schema resolution.
//
// Headers used to be stripped here because the compiler sent Cache-Control on
// every request, which is not CORS-safelisted and so triggered a preflight
// that GitHub Pages answers with 405. its-compiler-js 1.3.0 sends that header
// only from a Node runtime, so the request is already a simple GET and the
// init object can be passed through untouched.
export default globalThis.fetch.bind(globalThis) as typeof globalThis.fetch;
