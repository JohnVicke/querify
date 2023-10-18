import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Client, createClient } from "../client";

describe("client", () => {
  let client: Client;
  let cache;
  beforeEach(() => {
    client = createClient();
    cache = client.getCache();
  });

  afterEach(() => {
    client.clear();
    client.unmount();
  });

  it("should create a client", () => {
    const client = createClient();
    expect(client).toHaveProperty("cache");
  });
});
