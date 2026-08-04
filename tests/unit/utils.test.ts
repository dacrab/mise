import { describe, expect, it } from "vitest";
import { convexId, getErrorMessage, safeRedirect } from "@/lib/utils";

describe("getErrorMessage", () => {
  it("extracts message from Error", () => {
    expect(getErrorMessage(new Error("oops"))).toBe("oops");
  });
  it("returns string errors directly", () => {
    expect(getErrorMessage("bad input")).toBe("bad input");
  });
  it("returns fallback for unknown types", () => {
    expect(getErrorMessage(null)).toBe("Something went wrong");
    expect(getErrorMessage(42)).toBe("Something went wrong");
    expect(getErrorMessage({ foo: "bar" })).toBe("Something went wrong");
  });
});

describe("safeRedirect", () => {
  it("accepts internal paths", () => {
    expect(safeRedirect("/dashboard")).toBe("/dashboard");
    expect(safeRedirect("/")).toBe("/");
    expect(safeRedirect("/recipes/abc-123")).toBe("/recipes/abc-123");
  });

  it("rejects absolute URLs and protocol-relative URLs", () => {
    expect(safeRedirect("https://evil.com")).toBeUndefined();
    expect(safeRedirect("//evil.com")).toBeUndefined();
    expect(safeRedirect("javascript:alert(1)")).toBeUndefined();
  });

  it("returns undefined for empty or missing values", () => {
    expect(safeRedirect()).toBeUndefined();
    expect(safeRedirect("")).toBeUndefined();
    expect(safeRedirect(undefined)).toBeUndefined();
  });
});

describe("convexId", () => {
  it("accepts a well-formed Convex id", () => {
    expect(convexId("users|abcdefghijklmnopqrstuvwx")).toBe("users|abcdefghijklmnopqrstuvwx");
  });

  it("throws for malformed ids", () => {
    expect(() => convexId("not-an-id")).toThrow(/Invalid Convex ID format/);
    expect(() => convexId("users|short")).toThrow(/Invalid Convex ID format/);
    expect(() => convexId("|abcdefghijklmnopqrstuvwx")).toThrow(/Invalid Convex ID format/);
    expect(() => convexId("")).toThrow(/Invalid Convex ID format/);
  });
});
