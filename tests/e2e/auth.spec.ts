import { expect, test } from "@playwright/test";

test.describe("Auth flows", () => {
  test("shows signup form fields and login link", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });

  test("shows login form fields and signup link", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /create one/i })).toHaveAttribute("href", "/signup");
  });

  test("shows forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset code|continue/i })).toBeVisible();
  });

  test("login with wrong credentials stays on login and shows an error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("nobody@nowhere.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("alert").or(page.locator("[data-error]"))).toBeVisible({ timeout: 5000 });
  });
});
