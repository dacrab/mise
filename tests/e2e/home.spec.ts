import { expect, test } from "@playwright/test";

test.describe("Home", () => {
  test("renders hero and search", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder(/what are you craving\?/i)).toBeVisible();
  });
});
