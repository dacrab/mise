import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatSeconds, getErrorMessage, timeAgo } from "@/lib/utils";

describe("formatSeconds", () => {
  it.each([
    [0, "0:00"],
    [65, "1:05"],
    [3600, "60:00"],
  ])("formatSeconds(%i) → %s", (input, expected) => {
    expect(formatSeconds(input)).toBe(expected);
  });
});

describe("getErrorMessage", () => {
  it("extracts message from Error", () => {
    expect(getErrorMessage(new Error("oops"))).toBe("oops");
  });
  it("returns string errors directly", () => {
    expect(getErrorMessage("bad input")).toBe("bad input");
  });
  it("returns fallback for unknown types", () => {
    expect(getErrorMessage(null)).toBe("Something went wrong");
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T12:00:00Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("returns 'just now' for recent timestamps", () => {
    expect(timeAgo(Date.now() - 30_000)).toBe("just now");
  });
  it("returns 'Xm ago' for minutes", () => {
    expect(timeAgo(Date.now() - 60_000)).toBe("1m ago");
  });
  it("returns 'Xh ago' for hours", () => {
    expect(timeAgo(Date.now() - 3_600_000)).toBe("1h ago");
  });
  it("returns 'Xd ago' for days", () => {
    expect(timeAgo(Date.now() - 86_400_000)).toBe("1d ago");
  });
  it("returns locale date for 7+ days", () => {
    const sevenDaysAgo = Date.now() - 7 * 86_400_000;
    expect(timeAgo(sevenDaysAgo)).toBe(new Date(sevenDaysAgo).toLocaleDateString());
  });
});
