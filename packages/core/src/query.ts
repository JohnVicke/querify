import { Client } from ".";

export type QueryKey = PropertyKey[];

interface QueryState<TData = unknown, TError = Error> {
  status: "idle" | "loading" | "success" | "error";
  data: TData | null;
  error: TError | null;
}

type UpdateFn = <TData, TError>(
  state: QueryState<TData, TError>,
) => QueryState<TData, TError>;

interface CreateQueryOptions<TData = unknown> {
  key: QueryKey;
  queryFn: (...args: any) => Promise<TData>;
  onSuccess?: (data: TData) => void | Promise<void>;
}

export function createQuery<TData = unknown, TError = Error>(
  client: Client,
  queryOptions: CreateQueryOptions<TData>,
) {
  const hash = hashKey(queryOptions.key);

  const state = {
    status: "idle",
    data: null,
    error: null,
  } satisfies QueryState<TData, TError>;

  const query = {
    hash,
    key: queryOptions.key,
    state,
  };

  function update(updateFn: UpdateFn) {
    query.state = updateFn<TData, TError>(query.state);
  }

  return query;
}

function hashKey(key: QueryKey) {
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
