import { createQueryCache } from "./cache";

export function createClient() {
  const queryCache = createQueryCache();

  return {
    mount() {
      console.log("client mounted");
    },
    getQueryCache() {
      return queryCache;
    },
    clear() {
      queryCache.clear();
    },
    unmount() {
      console.log("client unmounted");
    },
  };
}

export type Client = ReturnType<typeof createClient>;
