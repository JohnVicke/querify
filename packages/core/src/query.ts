import { Client } from ".";

export type QueryKey = PropertyKey[];

interface QueryState<TData, TError> {
  status?: "success" | "error";
  data: TData | null;
  error: TError | null;
  isFetching: boolean;
}

interface CreateQueryOptions<TData> {
  key: QueryKey;
  queryFn: (...args: any) => Promise<TData>;
  onSuccess?: (data: TData) => void | Promise<void>;
}

interface Query<TData, TError> {
  key: QueryKey;
  hash: string;
  promise: Promise<void> | null;
  state: QueryState<TData, TError>;
  subscribers: Set<unknown>;
  setState: (updateFn: UpdateFn<TData, TError>) => void;
  fetch: () => Promise<void>;
}

type UpdateFn<TData, TError> = (
  state: QueryState<TData, TError>,
) => QueryState<TData, TError>;

export function createQuery<TData = unknown, TError = Error>(
  client: Client,
  queryOptions: CreateQueryOptions<TData>,
) {
  function setState(updateFn: UpdateFn<TData, TError>) {
    query.state = updateFn(query.state);
  }

  function fetch() {
    if (!query.promise) {
      query.promise = (async () => {
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
          }));
        } catch (error) {
          query.setState((state) => ({
            ...state,
            error: error as TError,
            status: "error",
          }));
        } finally {
          query.setState((state) => ({
            ...state,
            isFetching: false,
          }));
          query.promise = null;
        }
      })();
    }
    return query.promise;
  }

  const query: Query<TData, TError> = {
    key: queryOptions.key,
    hash: hashKey(queryOptions.key),
    promise: null,
    state: {
      data: null,
      error: null,
      isFetching: false,
    },
    subscribers: new Set(),
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
