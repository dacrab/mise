import { describe, it, expect } from "vitest";

// Timer formatting logic from CookingTimers
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Password strength calculation
function calculatePasswordStrength(password: string): number {
  if (password.length < 6) return 0;
  let strength = 1;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) strength++;
  return Math.min(strength, 3);
}

// Error message mapping
const ERROR_MESSAGES: Record<string, string> = {
  InvalidAccountId: "No account found with this email. Please sign up first.",
  InvalidSecret: "Incorrect password. Please try again.",
  TooManyFailedAttempts: "Too many failed attempts. Please try again later.",
  AccountAlreadyExists: "An account with this email already exists. Please sign in.",
  default: "An error occurred",
};

function getErrorMessage(error: string): string {
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (error.includes(key)) return value;
  }
  return ERROR_MESSAGES["default"] ?? "An error occurred";
}

describe("UI Utilities", () => {
  describe("formatTime", () => {
    it("formats seconds to mm:ss", () => {
      expect(formatTime(0)).toBe("0:00");
      expect(formatTime(30)).toBe("0:30");
      expect(formatTime(60)).toBe("1:00");
      expect(formatTime(90)).toBe("1:30");
      expect(formatTime(3600)).toBe("60:00");
    });

    it("pads single digit seconds", () => {
      expect(formatTime(65)).toBe("1:05");
      expect(formatTime(601)).toBe("10:01");
    });
  });

  describe("calculatePasswordStrength", () => {
    it("returns 0 for short passwords", () => {
      expect(calculatePasswordStrength("abc")).toBe(0);
      expect(calculatePasswordStrength("12345")).toBe(0);
    });

    it("returns 1 for basic 6+ char passwords", () => {
      expect(calculatePasswordStrength("abcdef")).toBe(1);
      expect(calculatePasswordStrength("123456")).toBe(1);
    });

    it("returns 2 for 8+ char passwords", () => {
      expect(calculatePasswordStrength("abcdefgh")).toBe(2);
      expect(calculatePasswordStrength("12345678")).toBe(2);
    });

    it("returns 3 for strong passwords with mixed case and special chars", () => {
      expect(calculatePasswordStrength("Password1!")).toBe(3);
      expect(calculatePasswordStrength("MyP@ssw0rd")).toBe(3);
    });
  });

  describe("getErrorMessage", () => {
    it("maps known error codes", () => {
      expect(getErrorMessage("InvalidAccountId")).toBe("No account found with this email. Please sign up first.");
      expect(getErrorMessage("InvalidSecret")).toBe("Incorrect password. Please try again.");
      expect(getErrorMessage("AccountAlreadyExists")).toBe("An account with this email already exists. Please sign in.");
    });

    it("returns default for unknown errors", () => {
      expect(getErrorMessage("SomeRandomError")).toBe("An error occurred");
    });

    it("handles error messages containing codes", () => {
      expect(getErrorMessage("Error: InvalidAccountId - user not found")).toBe(
        "No account found with this email. Please sign up first."
      );
    });
  });
});
