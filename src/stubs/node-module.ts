// Browser stub for Node's 'module' built-in (required by swisseph-wasm)
export const createRequire = () => () => { throw new Error('require() not available in browser'); };
export default { createRequire };
