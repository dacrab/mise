import { validateLength } from "convex/lib/validation";
import { describe, expect, it } from "vitest";

describe("validateLength", () => {
  it("returns the trimmed value when within bounds", () => {
    expect(validateLength("hello", 1, 10, "field")).toBe("hello");
  });

  it("trims whitespace before validation and returns trimmed value", () => {
    expect(validateLength("  hi  ", 1, 10, "field")).toBe("hi");
  });

  it("throws when value is empty", () => {
    expect(() => validateLength("", 1, 10, "field")).toThrow("field");
  });

  it("throws when only-whitespace input trims to empty", () => {
    expect(() => validateLength("   ", 1, 10, "field")).toThrow("field");
  });

  it("throws when value exceeds max length after trim", () => {
    expect(() => validateLength("a".repeat(11), 1, 10, "field")).toThrow("field");
  });

  it("does not count leading/trailing whitespace toward max length", () => {
    // 10 'a's padded with spaces — trimmed is exactly 10, should pass
    const s = `  ${"a".repeat(10)}  `;
    expect(validateLength(s, 1, 10, "field")).toBe("a".repeat(10));
  });

  it("accepts value at exact min boundary", () => {
    expect(validateLength("a", 1, 10, "field")).toBe("a");
  });

  it("accepts value at exact max boundary", () => {
    const s = "a".repeat(10);
    expect(validateLength(s, 1, 10, "field")).toBe(s);
  });

  it("throws one character over max boundary", () => {
    expect(() => validateLength("a".repeat(11), 1, 10, "field")).toThrow("field");
  });

  it("includes the field name in the thrown error message", () => {
    expect(() => validateLength("", 1, 10, "Recipe title")).toThrow("Recipe title");
  });
});
