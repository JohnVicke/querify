import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { QueryCache } from "../cache";
import { Client, createClient } from "../client";
import { QueryKey, createQuery, hashKey } from "../query";

describe("query", () => {
  let client: Client;
  let queryCache: QueryCache;
  beforeEach(() => {
    client = createClient();
    queryCache = client.getQueryCache();
  });

  afterEach(() => {
    client.clear();
    client.unmount();
  });

  it("should create a query with stable hash and defaultState", () => {
    const key = ["todos"] satisfies QueryKey;
    const hash = hashKey(key);
    const query = createQuery(client, {
      key,
      queryFn: () => Promise.resolve(),
    });
    const initialState = {
      data: null,
      error: null,
      isFetching: false,
    };
    expect(query.hash).toEqual(hash);
    expect(query.state).toEqual(initialState);
  });
});
