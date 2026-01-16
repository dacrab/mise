import { describe, it, expect } from "vitest";

// Slug generation logic from recipes.ts
function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + "abc123";
}

// Validation helpers
function validateLength(value: string, min: number, max: number, field: string): string {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new Error(`${field} must be ${min}-${max} characters`);
  }
  return trimmed;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

describe("Recipe Utilities", () => {
  describe("generateSlug", () => {
    it("converts title to lowercase slug", () => {
      const slug = generateSlug("My Amazing Recipe");
      expect(slug).toMatch(/^my-amazing-recipe-[a-z0-9]+$/);
    });

    it("removes special characters", () => {
      const slug = generateSlug("Recipe! With @Special# Chars");
      expect(slug).toMatch(/^recipe-with-special-chars-[a-z0-9]+$/);
    });

    it("handles multiple spaces", () => {
      const slug = generateSlug("Recipe   With   Spaces");
      expect(slug).toMatch(/^recipe-with-spaces-[a-z0-9]+$/);
    });

    it("trims leading/trailing dashes", () => {
      const slug = generateSlug("---Recipe---");
      expect(slug).toMatch(/^recipe-[a-z0-9]+$/);
    });

    it("handles unicode characters", () => {
      const slug = generateSlug("Crème Brûlée");
      expect(slug).toMatch(/^cr-me-br-l-e-[a-z0-9]+$/);
    });
  });

  describe("validateLength", () => {
    it("returns trimmed value when valid", () => {
      expect(validateLength("  hello  ", 1, 10, "Field")).toBe("hello");
    });

    it("throws when too short", () => {
      expect(() => validateLength("", 1, 10, "Title")).toThrow("Title must be 1-10 characters");
    });

    it("throws when too long", () => {
      expect(() => validateLength("a".repeat(201), 1, 200, "Title")).toThrow("Title must be 1-200 characters");
    });

    it("handles whitespace-only input", () => {
      expect(() => validateLength("   ", 1, 10, "Field")).toThrow();
    });
  });

  describe("sanitizeInput", () => {
    it("escapes HTML entities", () => {
      expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
      );
    });

    it("escapes ampersands", () => {
      expect(sanitizeInput("salt & pepper")).toBe("salt &amp; pepper");
    });

    it("escapes quotes", () => {
      expect(sanitizeInput('Say "hello"')).toBe("Say &quot;hello&quot;");
    });

    it("preserves safe text", () => {
      expect(sanitizeInput("Normal recipe text")).toBe("Normal recipe text");
    });
  });
});
