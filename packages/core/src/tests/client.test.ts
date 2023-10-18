import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Client, createClient } from "../client";

describe("client", () => {
  let client: Client;
  let queryCache;
  beforeEach(() => {
    client = createClient();
    queryCache = client.getQueryCache();
  });

  afterEach(() => {
    client.clear();
    client.unmount();
  });

  it("should create a client", () => {
    const client = createClient();
    expect(client.getQueryCache()).toBeTruthy();
  });
});
