import { Query } from "./query";

export function createQueryCache() {
  const cache = new Map<string, Query>();
  return {
    has(key: string) {
      return cache.has(key);
    },
    get<T>(key: string): Query<T> {
      return cache.get(key) as Query<T>;
    },
    add(key: string, value: Query) {
      cache.set(key, value);
    },
    delete(key: string) {
      cache.delete(key);
    },
    clear() {
      cache.clear();
    },
  };
}

export type QueryCache = ReturnType<typeof createQueryCache>;
