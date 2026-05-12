import { describe, expect, it } from "vitest";
import { CATEGORIES, CATEGORY_ICONS, DIFFICULTIES } from "@/lib/constants";

describe("constants", () => {
  it("has 10 categories", () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  it("every category has an icon", () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_ICONS[cat]).toBeDefined();
    }
  });

  it("icons are emoji strings", () => {
    for (const icon of Object.values(CATEGORY_ICONS)) {
      expect(icon.length).toBeGreaterThan(0);
    }
  });

  it("has 4 difficulty levels", () => {
    expect(DIFFICULTIES).toEqual(["Easy", "Medium", "Hard", "Expert"]);
  });
});
