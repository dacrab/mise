import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  DIFFICULTIES,
  MAX_COOK_MINUTES,
  MAX_IMAGE_BYTES,
  MAX_PREP_MINUTES,
  MAX_SERVINGS,
  MIN_COOK_MINUTES,
  MIN_PREP_MINUTES,
  MIN_SERVINGS,
} from "@/lib/constants";

describe("constants", () => {
  it("has 10 categories", () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  it("every category maps to a non-empty icon string", () => {
    for (const cat of CATEGORIES) {
      const icon = CATEGORY_ICONS[cat];
      expect(typeof icon).toBe("string");
      expect(icon.length).toBeGreaterThan(0);
    }
  });

  it("icons are defined only for known categories (no orphans)", () => {
    const keys = Object.keys(CATEGORY_ICONS) as (keyof typeof CATEGORY_ICONS)[];
    expect(keys.sort()).toEqual([...CATEGORIES].sort());
  });

  it("has 4 difficulty levels", () => {
    expect(DIFFICULTIES).toEqual(["Easy", "Medium", "Hard", "Expert"]);
  });

  it("prep/cook minute ranges are valid (min <= max, non-negative)", () => {
    expect(MIN_PREP_MINUTES).toBe(0);
    expect(MIN_COOK_MINUTES).toBe(0);
    expect(MAX_PREP_MINUTES).toBe(24 * 60);
    expect(MAX_COOK_MINUTES).toBe(24 * 60);
    expect(MIN_PREP_MINUTES).toBeLessThanOrEqual(MAX_PREP_MINUTES);
    expect(MIN_COOK_MINUTES).toBeLessThanOrEqual(MAX_COOK_MINUTES);
  });

  it("servings range is sane (at least 1, capped at 100)", () => {
    expect(MIN_SERVINGS).toBe(1);
    expect(MAX_SERVINGS).toBe(100);
    expect(MIN_SERVINGS).toBeLessThan(MAX_SERVINGS);
  });

  it("max image upload size is 5 MiB", () => {
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024);
  });
});
