import { createQueryCache } from "./cache";
import { createLogger } from "./logger";
import { hashKey, type CreateQueryOptions, createQuery, Query } from "./query";

export function createClient() {
  const logger = createLogger();
  const log = logger.withCtx("client");
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
      log(this.mount, "mounting");
    },
    getQueryCache() {
      return queryCache;
    },
    clear() {
      queryCache.clear();
    },
    unmount() {
      log(this.unmount, "unmounting");
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
      log(this.notify, "notifying");
      subscribers.forEach((callback) => callback());
    },
    queries() {
      return Array.from(queryCache.values()) as Query[];
    },
    _logger(ctx: string) {
      return logger.withCtx(ctx);
    },
  };
}

export type Client = ReturnType<typeof createClient>;
