import { createQueryCache } from "./cache";
import { hashKey, type CreateQueryOptions, createQuery, Query } from "./query";

export function createClient() {
  const queryCache = createQueryCache();
  const subscribers = [] as Array<() => void>;

  return {
    get<TData>(options: CreateQueryOptions<TData>) {
      const hashedKey = hashKey(options.key);
      if (queryCache.has(hashedKey)) {
        return queryCache.get(hashedKey);
      }
      const query = createQuery<TData>(this, options);
      queryCache.add(hashedKey, query as Query);
      return query;
    },
    mount() {
      console.log("[client:mount]");
    },
    getQueryCache() {
      return queryCache;
    },
    clear() {
      queryCache.clear();
    },
    unmount() {
      console.log("[client:unmount] clearing cache");
      this.clear();
      subscribers.length = 0;
    },
    subscribe(callback: () => void) {
      subscribers.push(callback);
      return () => {
        subscribers.filter((cb) => cb !== callback);
      };
    },
    notify() {
      console.log("[client:notify]");
      subscribers.forEach((callback) => callback());
    },
    queries() {
      return Array.from(queryCache.values()) as Query[];
    },
  };
}

export type Client = ReturnType<typeof createClient>;
