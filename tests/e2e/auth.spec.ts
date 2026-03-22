import { expect, test } from "@playwright/test";

test.describe("Auth flows", () => {
  test("shows signup form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /sign up|create account/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /log in|sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("shows forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("login with wrong credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("nobody@nowhere.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /log in|sign in/i }).click();
    await expect(page.getByRole("alert").or(page.locator("[data-error]"))).toBeVisible({ timeout: 5000 });
  });

  test("signup form validates empty fields", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: /sign up|create/i }).click();
    // Should not navigate away — still on signup
    await expect(page).toHaveURL(/signup/);
  });
});
