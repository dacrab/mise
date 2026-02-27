import { describe, it, expect } from "vitest";
import { formatTime, calculatePasswordStrength, getErrorMessage } from "@/lib/recipeUtils";

describe("formatTime", () => {
  it("formats 0 seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });
  it("formats 65 seconds", () => {
    expect(formatTime(65)).toBe("1:05");
  });
  it("formats exactly 1 minute", () => {
    expect(formatTime(60)).toBe("1:00");
  });
  it("formats 3600 seconds (1 hour)", () => {
    expect(formatTime(3600)).toBe("60:00");
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
