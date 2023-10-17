import { add } from ".";
import { it, expect, describe } from "bun:test";

describe("core", () => {
  describe("add", () => {
    it("adds two numbers", () => {
      expect(add(1, 2)).toEqual(3);
    });
  });
});
