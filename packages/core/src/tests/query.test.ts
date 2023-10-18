import { afterEach, beforeEach, describe } from "bun:test";
import { QueryCache } from "../cache";
import { Client, createClient } from "../client";

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
});
