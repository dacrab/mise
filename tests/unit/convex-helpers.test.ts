import { validateLength } from "convex/lib/helpers";
import { describe, expect, it } from "vitest";

describe("validateLength", () => {
  it("returns the value when within bounds", () => {
    expect(validateLength("hello", 1, 10, "field")).toBe("hello");
  });

  it("throws when value is too short", () => {
    expect(() => validateLength("", 1, 10, "field")).toThrow("field");
  });

  it("throws when value exceeds max length", () => {
    expect(() => validateLength("a".repeat(11), 1, 10, "field")).toThrow("field");
  });

  it("accepts value at exact min boundary", () => {
    expect(validateLength("a", 1, 10, "field")).toBe("a");
  });

  it("accepts value at exact max boundary", () => {
    const s = "a".repeat(10);
    expect(validateLength(s, 1, 10, "field")).toBe(s);
  });
});
