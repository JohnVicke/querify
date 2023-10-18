export function createQueryCache() {
  const cache = new Map();
  return {
    get(key) {
      return cache.get(key);
    },
    add(key, value) {
      cache.set(key, value);
    },
    clear() {
      cache.clear();
    },
  };
}

export type QueryCache = ReturnType<typeof createQueryCache>;
