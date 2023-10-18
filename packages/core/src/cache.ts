export function createQueryCache() {
  const cache = new Map();
  return {
    get(key: any) {
      return cache.get(key);
    },
    add(key: any, value: any) {
      cache.set(key, value);
    },
    clear() {
      cache.clear();
    },
  };
}

export type QueryCache = ReturnType<typeof createQueryCache>;
