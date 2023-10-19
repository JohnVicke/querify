import { createQueryCache } from "./cache";
import { hashKey, type CreateQueryOptions, createQuery, Query } from "./query";

export function createClient() {
  const queryCache = createQueryCache();

  return {
    get<TData>(options: CreateQueryOptions<TData>) {
      const hashedKey = hashKey(options.key);
      if (queryCache.has(hashedKey)) {
        return queryCache.get(hashedKey) as Query<TData>;
      }
      const query = createQuery<TData>(this, options);
      queryCache.add(hashedKey, query);
      return query;
    },
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
