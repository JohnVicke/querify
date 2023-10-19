import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { createQueryObserver } from "../observer";
import { Client, createClient } from "../client";
import { QueryCache } from "../cache";

describe("observer", () => {
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

  it("should create an observer", () => {
    const observer = createQueryObserver(client, {
      key: ["todos"],
      queryFn: () => Promise.resolve("data"),
    });
    observer.subscribe(() => console.log("observer subscribed"));
    observer.fetch();
    expect(observer.getResult()).toBeTruthy();
  });
});
