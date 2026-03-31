import { describe, expect, it } from "vitest";
import { calculatePasswordStrength, formatSeconds, getErrorMessage } from "@/lib/recipeUtils";

describe("formatSeconds", () => {
  it.each([
    [0, "0:00"],
    [60, "1:00"],
    [65, "1:05"],
    [3600, "60:00"],
  ])("formatSeconds(%i) → %s", (input, expected) => {
    expect(formatSeconds(input)).toBe(expected);
  });
});

describe("calculatePasswordStrength", () => {
  it("returns 0 for empty string", () => {
    expect(calculatePasswordStrength("")).toBe(0);
  });
  it("returns 1 for 8-char lowercase-only password", () => {
    expect(calculatePasswordStrength("password")).toBe(1);
  });
  it("returns higher score for complex password", () => {
    expect(calculatePasswordStrength("P@ssw0rd!Extra")).toBe(4);
  });
  it("caps at 4", () => {
    expect(calculatePasswordStrength("A1!bcdefghijklmno")).toBe(4);
  });
});

describe("getErrorMessage", () => {
  it("extracts message from Error instance", () => {
    expect(getErrorMessage(new Error("oops"))).toBe("oops");
  });
  it("returns string errors directly", () => {
    expect(getErrorMessage("bad input")).toBe("bad input");
  });
  it("returns fallback for unknown error types", () => {
    expect(getErrorMessage(null)).toBe("Something went wrong");
    expect(getErrorMessage(42)).toBe("Something went wrong");
    expect(getErrorMessage({})).toBe("Something went wrong");
  });
});
