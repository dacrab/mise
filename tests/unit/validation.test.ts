import { describe, expect, it } from "vitest";

// Inline the validated logic (previously convex/lib/validation.ts)
function validateLength(value: string, min: number, max: number, field: string) {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new Error(`${field} must be ${min}-${max} characters`);
  }
  return trimmed;
}

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

  it("does not count leading/trailing whitespace toward max length", () => {
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
