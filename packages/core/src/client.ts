import { createCache } from "./cache";

export function createClient() {
  const cache = createCache();
  return {
    mount() {
      console.log("client mounted");
    },
    getCache() {
      return cache;
    },
    clear() {
      cache.clear();
    },
    unmount() {
      console.log("client unmounted");
    },
  };
}

export type Client = ReturnType<typeof createClient>;
