import { generateSlug } from "convex/recipes";
import { describe, expect, it } from "vitest";

describe("generateSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(generateSlug("My Great Recipe")).toBe("my-great-recipe");
  });

  it("strips special characters", () => {
    expect(generateSlug("Crème Brûlée!!!")).toBe("cr-me-br-l-e");
  });

  it("base contains only lowercase letters, digits, and hyphens", () => {
    expect(generateSlug("  Weird @#$ TITLE__with  spaces  ")).toMatch(/^[a-z0-9-]+$/);
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug("---hello---")).toBe("hello");
  });

  it("truncates base to 80 chars", () => {
    expect(generateSlug("a".repeat(100)).length).toBeLessThanOrEqual(80);
  });

  it("falls back to 'recipe' base when title yields no characters", () => {
    for (const title of ["", "   ", "!!!", "日本語", "---"]) {
      expect(generateSlug(title)).toBe("recipe");
    }
  });

  it("is deterministic for the same title", () => {
    expect(generateSlug("test")).toBe(generateSlug("test"));
  });

  it("appends an alphanumeric suffix when provided", () => {
    expect(generateSlug("test", "1")).toBe("test-1");
    expect(generateSlug("test", "a")).toBe("test-a");
    expect(generateSlug("test", "1")).toMatch(/^test-[a-z0-9]+$/);
  });

  it("appends suffix to the fallback base", () => {
    expect(generateSlug("!!!", "2")).toBe("recipe-2");
  });
});
