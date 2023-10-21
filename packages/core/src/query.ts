import { Client } from ".";
import { Observer } from "./observer";
import { exhaustive, iife } from "@querify/utils";

export type QueryKey = PropertyKey[];

interface FetchingQueryState {
  status: "fetching";
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
  lastUpdated?: number;
} & (SuccesfulQueryState<TData> | ErrorQueryState | FetchingQueryState);

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
  getResult: () => QueryResult<TData>;
}

type SuccessQueryResult<TData> = {
  status: "success";
  data: TData;
  isSuccess: true;
  isFetching: false;
  isError: false;
  error?: never;
};

type ErrorQueryResult = {
  status: "error";
  error: Error;
  isError: true;
  isFetching: false;
  isSuccess: false;
  data?: never;
};

type FetchingQueryResult = {
  status: "fetching";
  isFetching?: boolean;
  isSuccess?: never;
  isError?: never;
  error?: never;
  data?: never;
};

export type QueryResult<TData> =
  | SuccessQueryResult<TData>
  | ErrorQueryResult
  | FetchingQueryResult;

type UpdateFn<TData> = (state: QueryState<TData>) => QueryState<TData>;

export function createQuery<TData = unknown>(
  client: Client,
  queryOptions: CreateQueryOptions<TData>,
) {
  const log = client._logger("query");
  function setState(updateFn: UpdateFn<TData>) {
    query.state = updateFn(query.state);
    query.subscribers.forEach((observer) => {
      observer.notify();
    });
    client.notify();
  }

  function fetch() {
    log(fetch, "fetching");
    if (!query.promise) {
      query.promise = iife(async () => {
        query.setState((state) => ({
          ...state,
          stats: "fetching",
        }));
        try {
          const data = await queryOptions.queryFn();
          query.setState(() => ({
            status: "success",
            data,
            lastUpdated: Date.now(),
          }));
        } catch (error) {
          query.setState(() => ({
            status: "error",
            error: error as Error,
          }));
        } finally {
          query.setState((state) => ({
            ...state,
          }));
          query.promise = null;
        }
      });
    }
    return query.promise;
  }

  function scheduleGC() {
    log(scheduleGC, "scheduling GC");
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
      log(clearGC, "clearing GC");
      clearTimeout(query.gcTimeout);
      query.gcTimeout = null;
    }
  }

  function getResult<T>(): QueryResult<T> {
    switch (query.state.status) {
      case "fetching":
        return {
          status: query.state.status,
          isFetching: query.state.status === "fetching",
        };
      case "success":
        return {
          status: "success",
          isSuccess: true,
          isFetching: false,
          isError: false,
          data: query.state.data as unknown as T,
        };
      case "error":
        return {
          status: "error",
          error: query.state.error,
          isError: true,
          isFetching: false,
          isSuccess: false,
        };

      default:
        return exhaustive(query.state);
    }
  }

  const query: Query<TData> = {
    key: queryOptions.key,
    hash: hashKey(queryOptions.key),
    gcTimeout: null,
    promise: null,
    state: {
      status: "fetching",
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
    getResult,
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
