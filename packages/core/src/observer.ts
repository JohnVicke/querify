import { Client } from ".";
import { CreateQueryOptions, QueryState } from "./query";

export interface Observer<TData> {
  notify: () => void;
  getResult: () => QueryState<TData>;
  subscribe: (callback: () => void) => () => void;
  fetch: () => void;
}

export function createQueryObserver<TData>(
  client: Client,
  options: CreateQueryOptions<TData>,
) {
  const query = client.get(options);

  const observer: Observer<TData> = {
    notify: () => {},
    getResult: () => query.state as QueryState<TData>,
    subscribe: (callback: () => void) => {
      observer.notify = callback;
      const unsubscribe = query.subscribe(observer);
      observer.fetch();
      return unsubscribe;
    },
    fetch: () => {
      if (
        !query.state.lastUpdated ||
        Date.now() - query.state.lastUpdated > (options?.staleTime ?? 0)
      ) {
        console.log("[observer:fetch]", query.key);
        query.fetch();
      }
    },
  };

  return observer;
}
