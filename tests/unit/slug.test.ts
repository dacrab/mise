import { generateSlug } from "convex/lib/slug";
import { describe, expect, it } from "vitest";

function splitSlug(slug: string): { base: string; suffix: string } {
  const idx = slug.lastIndexOf("-");
  return { base: slug.slice(0, idx), suffix: slug.slice(idx + 1) };
}

describe("generateSlug", () => {
  it("lowercases and hyphenates", () => {
    const { base, suffix } = splitSlug(generateSlug("My Great Recipe"));
    expect(base).toBe("my-great-recipe");
    expect(suffix).toMatch(/^[a-z0-9]+$/);
  });

  it("strips special characters", () => {
    const { base } = splitSlug(generateSlug("Crème Brûlée!!!"));
    expect(base).toBe("cr-me-br-l-e");
  });

  it("base contains only lowercase letters, digits, and hyphens", () => {
    const { base } = splitSlug(generateSlug("  Weird @#$ TITLE__with  spaces  "));
    expect(base).toMatch(/^[a-z0-9-]+$/);
  });

  it("trims leading/trailing hyphens", () => {
    const { base } = splitSlug(generateSlug("---hello---"));
    expect(base).toBe("hello");
  });

  it("truncates base to 80 chars", () => {
    const { base } = splitSlug(generateSlug("a".repeat(100)));
    expect(base.length).toBeLessThanOrEqual(80);
  });

  it("appends a unique, non-empty alphanumeric suffix", () => {
    const a = generateSlug("test");
    const b = generateSlug("test");
    const aSuffix = splitSlug(a).suffix;
    const bSuffix = splitSlug(b).suffix;
    expect(a).not.toBe(b);
    expect(aSuffix).toBeTruthy();
    expect(bSuffix).toBeTruthy();
    expect(aSuffix).not.toBe(bSuffix);
    expect(aSuffix).toMatch(/^[a-z0-9]+$/);
  });
});
