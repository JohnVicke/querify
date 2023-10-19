import { Client } from ".";
import { CreateQueryOptions, QueryState } from "./query";

export interface Observer<TData, TError> {
  notify: () => void;
  getResult: () => QueryState<TData, TError>;
  subscribe: (callback: () => void) => () => void;
  fetch: () => void;
}

export function createQueryObserver<TData, TError>(
  client: Client,
  options: CreateQueryOptions<TData> & { staleTime?: number },
) {
  const query = client.get(options);

  const observer = {
    notify: () => {},
    getResult: () => query.state,
    subscribe: (callback: () => void) => {
      observer.notify = callback;
      const unsubscribe = query.subscribe(observer);
      observer.fetch();
      return unsubscribe;
    },
    fetch: () => {
      query.fetch();
    },
  } satisfies Observer<TData, TError>;

  return observer;
}
