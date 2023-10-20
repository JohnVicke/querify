import { Client } from ".";
import { Observer } from "./observer";
import { iife } from "@querify/utils";

export type QueryKey = PropertyKey[];

interface IdleQueryState {
  status: "idle";
  error?: never;
  data?: never;
}

interface SuccesfulQueryState<TData> {
  status: "success";
  data: TData;
  error?: never;
}

interface ErrorQueryState {
  status: "error";
  error: Error;
  data?: never;
}

export type QueryState<TData> = {
  isFetching: boolean;
  lastUpdated?: number;
} & (SuccesfulQueryState<TData> | ErrorQueryState | IdleQueryState);

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
    client.notify();
  }

  function fetch() {
    console.log("[query:fetch]", query.key);
    if (!query.promise) {
      query.promise = iife(async () => {
        query.setState((state) => ({
          ...state,
          isFetching: true,
        }));
        try {
          const data = await queryOptions.queryFn();
          query.setState((state) => ({
            status: "success",
            data,
            isFetching: state.isFetching,
            lastUpdated: Date.now(),
          }));
        } catch (error) {
          query.setState((state) => ({
            status: "error",
            isFetching: state.isFetching,
            error: error as Error,
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
    console.log("[query:scheduleGC]", query.key);
    query.gcTimeout = setTimeout(
      () => {
        client.getQueryCache().delete(query.hash);
        client.notify();
      },
      5 * 60 * 1000, // queryOptions.cacheTime ??
    );
  }

  function clearGC() {
    if (query.gcTimeout) {
      console.log("[query:clearGC]", query.key);
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
      status: "idle",
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
