/**
 * swisseph-stub.ts
 * 
 * Empty stub for swisseph-wasm. Used when building for the edge/client
 * where VITE_USE_EDGE_EPHEMERIS=true is set, preventing the 2MB WASM
 * blob from being included in the client bundle.
 */

export default {
  init: () => { throw new Error("swisseph-wasm runs on the edge"); },
  close: () => {},
};
