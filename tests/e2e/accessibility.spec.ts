import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("home page has exactly one main landmark and a navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("login inputs have associated labels", async ({ page }) => {
    await page.goto("/login");
    // getByRole + name verifies the input's accessible name is derived from a
    // real <label> association, not just that some label text is visible.
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /password/i })).toBeVisible();
  });
});
