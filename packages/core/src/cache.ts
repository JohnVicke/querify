export function createCache() {
  const cache = new Map();
  return {
    get(key) {
      return cache.get(key);
    },
    clear() {
      cache.clear();
    },
  };
}
