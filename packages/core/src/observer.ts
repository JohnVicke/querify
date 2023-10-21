import { Client } from ".";
import { CreateQueryOptions, QueryResult, QueryState } from "./query";

export interface Observer<TData> {
  notify: () => void;
  getResult: () => QueryResult<TData>;
  subscribe: (callback: () => void) => () => void;
  fetch: () => void;
}

export function createQueryObserver<TData>(
  client: Client,
  options: CreateQueryOptions<TData>,
) {
  const log = client._logger("observer");
  const query = client.get(options);

  const observer: Observer<TData> = {
    notify: () => {},
    getResult: () => {
      return query.getResult() as QueryResult<TData>;
    },
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
        log(observer.fetch, "fetching");
        query.fetch();
      }
    },
  };

  return observer;
}
