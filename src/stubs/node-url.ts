// Browser stub for Node's 'url' module (required by swisseph-wasm)
export const fileURLToPath = (url: string) => url;
export const pathToFileURL = (p: string) => ({ href: p });
export const URL = globalThis.URL;
export default { fileURLToPath, pathToFileURL, URL };
