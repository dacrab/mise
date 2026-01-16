import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test("displays login form", async ({ page }) => {
      await page.goto("/login");
      
      await expect(page.getByText("Welcome back")).toBeVisible();
      await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
      await expect(page.getByPlaceholder(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
    });

    test("shows validation errors for empty form", async ({ page }) => {
      await page.goto("/login");
      
      // Try to submit empty form
      await page.getByRole("button", { name: /Sign in/i }).click();
      
      // HTML5 validation should prevent submission
      const emailInput = page.getByPlaceholder("you@example.com");
      await expect(emailInput).toHaveAttribute("required", "");
    });

    test("shows error for invalid credentials", async ({ page }) => {
      await page.goto("/login");
      
      await page.getByPlaceholder("you@example.com").fill("invalid@test.com");
      await page.getByPlaceholder(/password/i).fill("wrongpassword");
      await page.getByRole("button", { name: /Sign in/i }).click();
      
      // Should show error message
      await expect(page.getByText(/No account found|Incorrect password|error/i)).toBeVisible({ timeout: 10000 });
    });

    test("has link to signup", async ({ page }) => {
      await page.goto("/login");
      
      await page.getByRole("link", { name: /sign up|create account/i }).click();
      await expect(page).toHaveURL("/signup");
    });

    test("has forgot password link", async ({ page }) => {
      await page.goto("/login");
      
      await page.getByRole("link", { name: /forgot password/i }).click();
      await expect(page).toHaveURL("/forgot-password");
    });
  });

  test.describe("Signup Page", () => {
    test("displays signup form", async ({ page }) => {
      await page.goto("/signup");
      
      await expect(page.getByText(/join|create|sign up/i).first()).toBeVisible();
      await expect(page.getByPlaceholder(/name/i)).toBeVisible();
      await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
      await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    });

    test("shows password strength indicator", async ({ page }) => {
      await page.goto("/signup");
      
      const passwordInput = page.getByPlaceholder(/password/i);
      
      // Type weak password
      await passwordInput.fill("abc");
      await expect(page.getByText(/too short|weak/i)).toBeVisible();
      
      // Type stronger password
      await passwordInput.fill("StrongP@ss1");
      await expect(page.getByText(/strong|good/i)).toBeVisible();
    });

    test("has link to login", async ({ page }) => {
      await page.goto("/signup");
      
      await page.getByRole("link", { name: /sign in|log in/i }).click();
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Forgot Password Page", () => {
    test("displays forgot password form", async ({ page }) => {
      await page.goto("/forgot-password");
      
      await expect(page.getByText(/forgot password/i)).toBeVisible();
      await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
      await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
    });

    test("has back to login link", async ({ page }) => {
      await page.goto("/forgot-password");
      
      await page.getByRole("link", { name: /back to login/i }).click();
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Protected Routes", () => {
    test("redirects to login when accessing dashboard", async ({ page }) => {
      await page.goto("/dashboard");
      
      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test("redirects to login when accessing settings", async ({ page }) => {
      await page.goto("/settings");
      
      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test("redirects to login when creating recipe", async ({ page }) => {
      await page.goto("/dashboard/create");
      
      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });
  });
});
