import { Client } from ".";
import { Observer } from "./observer";
import { iife } from "./utils";

export type QueryKey = PropertyKey[];

export interface QueryState<TData> {
  status?: "success" | "error";
  data: TData | null;
  error: Error | null;
  isFetching: boolean;
  lastUpdated?: number;
}

export interface CreateQueryOptions<TData> {
  key: QueryKey;
  queryFn: () => Promise<TData>;
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  staleTime?: number;
  cacheTime?: number;
}

export interface Query<TData = unknown> {
  key: QueryKey;
  hash: string;
  promise: Promise<void> | null;
  state: QueryState<TData>;
  subscribe: (observer: Observer<TData>) => () => void;
  subscribers: Set<Observer<TData>>;
  setState: (updateFn: UpdateFn<TData>) => void;
  fetch: () => Promise<void>;
  gcTimeout: Timer | null;
}

type UpdateFn<TData> = (state: QueryState<TData>) => QueryState<TData>;

export function createQuery<TData = unknown>(
  client: Client,
  queryOptions: CreateQueryOptions<TData>,
) {
  function setState(updateFn: UpdateFn<TData>) {
    query.state = updateFn(query.state);
    query.subscribers.forEach((observer) => {
      observer.notify();
    });
  }

  function fetch() {
    if (!query.promise) {
      query.promise = iife(async () => {
        query.setState((state) => ({
          ...state,
          isFetching: true,
        }));
        try {
          const data = await queryOptions.queryFn();
          query.setState((state) => ({
            ...state,
            data,
            status: "success",
            lastUpdated: Date.now(),
          }));
        } catch (error) {
          query.setState((state) => ({
            ...state,
            error: error as Error,
            status: "error",
          }));
        } finally {
          query.setState((state) => ({
            ...state,
            isFetching: false,
          }));
          query.promise = null;
        }
      });
    }
    return query.promise;
  }

  function scheduleGC() {
    query.gcTimeout = setTimeout(
      () => {
        client.getQueryCache().delete(query.hash);
      },
      queryOptions.cacheTime ?? 5 * 60 * 1000,
    );
  }

  function clearGC() {
    if (query.gcTimeout) {
      clearTimeout(query.gcTimeout);
      query.gcTimeout = null;
    }
  }

  const query: Query<TData> = {
    key: queryOptions.key,
    hash: hashKey(queryOptions.key),
    gcTimeout: null,
    promise: null,
    state: {
      data: null,
      error: null,
      isFetching: false,
    },
    subscribers: new Set(),
    subscribe: (observer) => {
      query.subscribers.add(observer);
      clearGC();
      return () => {
        scheduleGC();
      };
    },
    setState,
    fetch,
  };

  return query;
}

export function hashKey(key: QueryKey) {
  const concatentatedKey = key.join("|");

  if (concatentatedKey.length === 0) {
    throw new Error("Cannot hash an empty key");
  }

  const hash = concatentatedKey.split("").reduce((acc, char) => {
    const charCode = char.charCodeAt(0);
    return (acc << 5) - acc + charCode;
  }, 0);

  return hash.toString();
}
