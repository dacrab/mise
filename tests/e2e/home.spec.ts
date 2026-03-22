import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("loads and shows recipe grid", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("search input is present", async ({ page }) => {
    await expect(page.getByPlaceholder(/craving/i)).toBeVisible();
  });

  test("navigates to recipe page on card click", async ({ page }) => {
    const firstCard = page.locator("a[href^='/recipe/']").first();
    await firstCard.waitFor({ state: "visible" });
    await firstCard.click();
    await expect(page).toHaveURL(/\/recipe\//);
  });
});
