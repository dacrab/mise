import { test, expect } from "@playwright/test";

test.describe("Recipe page", () => {
  test("loads a recipe by slug", async ({ page }) => {
    // Navigate to homepage first to find a real recipe link
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const recipeLink = page.locator("a[href^='/recipe/']").first();
    const exists = await recipeLink.count() > 0;
    if (!exists) {
      test.skip(true, "No public recipes available to test");
      return;
    }

    const href = await recipeLink.getAttribute("href");
    await page.goto(href!);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("print route renders recipe without nav", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const recipeLink = page.locator("a[href^='/recipe/']").first();
    if (await recipeLink.count() === 0) {
      test.skip(true, "No public recipes available");
      return;
    }

    const href = await recipeLink.getAttribute("href");
    await page.goto(`${href}/print`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Print view should not have the site header nav
    await expect(page.locator("nav")).toHaveCount(0);
  });
});
