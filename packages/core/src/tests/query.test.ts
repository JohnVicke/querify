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

    expect(query.hash).toEqual(hash);
    expect(query.state).toEqual({
      status: "fetching",
    });
  });
  it("should query data and update state", async () => {
    const key = ["todos"] satisfies QueryKey;
    const query = createQuery(client, {
      key,
      queryFn: () => Promise.resolve("data"),
    });
    await query.fetch();
    expect(query.state.data).toEqual("data");
    expect(query.state.status).toEqual("success");
  });
  it("should dedup async function with the same query key", async () => {
    const key = ["todos"] satisfies QueryKey;
    const query = createQuery(client, {
      key,
      queryFn: () => Promise.resolve("data"),
    });
    const promise1 = query.fetch();
    const promise2 = query.fetch();
    expect(promise1).toEqual(promise2);
  });
});
