import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows recipe grid", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("search input is present", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("navigates to recipe page on card click", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("a[href^='/recipe/']").first();
    await firstCard.waitFor({ state: "visible" });
    await firstCard.click();
    await expect(page).toHaveURL(/\/recipe\//);
  });
});
