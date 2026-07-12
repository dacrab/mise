import { generateSlug } from "convex/lib/slug";
import { describe, expect, it } from "vitest";

describe("generateSlug", () => {
  it("lowercases and hyphenates", () => {
    const slug = generateSlug("My Great Recipe");
    expect(slug).toMatch(/^my-great-recipe-/);
  });

  it("strips special characters", () => {
    const slug = generateSlug("Crème Brûlée!!!");
    expect(slug).toMatch(/^cr-me-br-l-e-/);
  });

  it("trims leading/trailing hyphens", () => {
    const slug = generateSlug("---hello---");
    expect(slug).toMatch(/^hello-/);
  });

  it("truncates base to 80 chars", () => {
    const long = "a".repeat(100);
    const slug = generateSlug(long);
    const base = slug.split("-").slice(0, -1).join("-");
    expect(base.length).toBeLessThanOrEqual(80);
  });

  it("appends a unique suffix", () => {
    const a = generateSlug("test");
    const b = generateSlug("test");
    expect(a).not.toBe(b);
  });
});
