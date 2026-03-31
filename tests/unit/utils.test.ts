import { describe, expect, it } from "vitest";
import { CATEGORIES, CATEGORY_ICONS, DIFFICULTIES } from "@/lib/constants";
import { formatSeconds, timeAgo, getErrorMessage } from "@/lib/utils";
import { calculatePasswordStrength } from "@/lib/auth";

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
  it("returns fallback for undefined", () => {
    expect(getErrorMessage(undefined)).toBe("Something went wrong");
  });
});

describe("formatSeconds — boundary cases", () => {
  it("formats 5 seconds as 0:05", () => {
    expect(formatSeconds(5)).toBe("0:05");
  });
  it("formats 59 seconds as 0:59", () => {
    expect(formatSeconds(59)).toBe("0:59");
  });
  it("formats 61 seconds as 1:01", () => {
    expect(formatSeconds(61)).toBe("1:01");
  });
  it("formats 0 seconds as 0:00", () => {
    expect(formatSeconds(0)).toBe("0:00");
  });
});

describe("timeAgo", () => {
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
  it("boundary: exactly 1 minute (60 000ms) shows 'Xm ago'", () => {
    expect(timeAgo(Date.now() - 60_000)).toBe("1m ago");
  });
  it("boundary: exactly 1 hour (3 600 000ms) shows 'Xh ago'", () => {
    expect(timeAgo(Date.now() - 3_600_000)).toBe("1h ago");
  });
  it("boundary: exactly 1 day (86 400 000ms) shows 'Xd ago'", () => {
    expect(timeAgo(Date.now() - 86_400_000)).toBe("1d ago");
  });
});

describe("CATEGORIES constant", () => {
  it("is an array of 10 items", () => {
    expect(CATEGORIES).toHaveLength(10);
  });
  it("contains expected category names", () => {
    expect(CATEGORIES).toContain("Breakfast");
    expect(CATEGORIES).toContain("Dinner");
    expect(CATEGORIES).toContain("Vegan");
    expect(CATEGORIES).toContain("Quick & Easy");
  });
  it("contains only strings", () => {
    for (const c of CATEGORIES) expect(typeof c).toBe("string");
  });
});

describe("CATEGORY_ICONS constant", () => {
  it("has an icon for every category", () => {
    for (const c of CATEGORIES) {
      expect(CATEGORY_ICONS[c]).toBeDefined();
      expect(typeof CATEGORY_ICONS[c]).toBe("string");
      expect(CATEGORY_ICONS[c]!.length).toBeGreaterThan(0);
    }
  });
  it("does not have extra keys beyond CATEGORIES", () => {
    const iconKeys = Object.keys(CATEGORY_ICONS);
    const catSet = new Set(CATEGORIES as readonly string[]);
    for (const key of iconKeys) expect(catSet.has(key)).toBe(true);
  });
});

describe("DIFFICULTIES constant", () => {
  it("is an array of 4 items", () => {
    expect(DIFFICULTIES).toHaveLength(4);
  });
  it("contains Easy, Medium, Hard, Expert", () => {
    expect(DIFFICULTIES).toContain("Easy");
    expect(DIFFICULTIES).toContain("Medium");
    expect(DIFFICULTIES).toContain("Hard");
    expect(DIFFICULTIES).toContain("Expert");
  });
  it("is ordered from easiest to hardest", () => {
    expect(DIFFICULTIES[0]).toBe("Easy");
    expect(DIFFICULTIES[3]).toBe("Expert");
  });
});
