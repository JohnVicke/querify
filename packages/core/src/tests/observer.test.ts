import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { createQueryObserver } from "../observer";
import { Client, createClient } from "../client";
import { QueryCache } from "../cache";
import { TypedEventEmitter, stateUpdate } from "./utils";

describe("observer", () => {
  let client: Client;
  let queryCache: QueryCache;
  const emitter = new TypedEventEmitter();
  beforeEach(() => {
    client = createClient();
    queryCache = client.getQueryCache();
  });

  afterEach(() => {
    client.clear();
    client.unmount();
  });

  it("should update state async", async () => {
    const observer = createQueryObserver(client, {
      key: ["todos"],
      queryFn: () => Promise.resolve("data"),
    });

    observer.subscribe(() => emitter.emit("stateChange", observer.getResult()));

    const result = await stateUpdate(emitter, "stateChange");

    expect(result).toEqual({
      status: "success",
      data: "data",
      isSuccess: true,
      isFetching: false,
      isError: false,
    });
  });

  it("should add error state async", async () => {
    const observer = createQueryObserver(client, {
      key: ["todos"],
      queryFn: () => Promise.reject(new Error("error")),
    });

    observer.subscribe(() => emitter.emit("stateChange", observer.getResult()));

    const result = await stateUpdate(emitter, "stateChange");

    expect(result).toEqual({
      status: "error",
      error: Error("error"),
      isSuccess: false,
      isFetching: false,
      isError: true,
    });
  });
});
