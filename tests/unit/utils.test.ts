import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatSeconds, timeAgo, getErrorMessage } from "@/lib/utils";

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
  it("returns fallback for undefined", () => {
    expect(getErrorMessage(undefined)).toBe("Something went wrong");
  });
});

describe("timeAgo", () => {
  const NOW = new Date("2026-01-10T12:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for timestamps under 1 minute ago", () => {
    expect(timeAgo(Date.now() - 30_000)).toBe("just now");
    expect(timeAgo(Date.now())).toBe("just now");
  });
  it("returns 'Xm ago' for 1–59 minutes ago", () => {
    expect(timeAgo(Date.now() - 60_000)).toBe("1m ago");
    expect(timeAgo(Date.now() - 59 * 60_000)).toBe("59m ago");
  });
  it("returns 'Xh ago' for 1–23 hours ago", () => {
    expect(timeAgo(Date.now() - 3_600_000)).toBe("1h ago");
    expect(timeAgo(Date.now() - 23 * 3_600_000)).toBe("23h ago");
  });
  it("returns 'Xd ago' for 1–6 days ago", () => {
    expect(timeAgo(Date.now() - 86_400_000)).toBe("1d ago");
    expect(timeAgo(Date.now() - 6 * 86_400_000)).toBe("6d ago");
  });
  it("returns a locale date string for 7+ days ago", () => {
    const sevenDaysAgo = Date.now() - 7 * 86_400_000;
    expect(timeAgo(sevenDaysAgo)).toBe(new Date(sevenDaysAgo).toLocaleDateString());
  });
});
