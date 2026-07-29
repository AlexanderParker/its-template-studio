// Browser shim for node-fetch. The native fetch implementation is used for
// remote schema resolution. Non-safelisted request headers are removed so
// simple GET requests do not trigger a CORS preflight, which static hosts
// such as GitHub Pages reject with 405.
const fetchImpl: typeof globalThis.fetch = (input, init) => {
  if (init === undefined) {
    return globalThis.fetch(input);
  }
  const { headers: _headers, ...rest } = init;
  return globalThis.fetch(input, rest);
};

export default fetchImpl;
