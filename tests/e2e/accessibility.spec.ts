import { expect, test } from "@playwright/test";

test.describe("Accessibility smoke checks", () => {
  test("home page exposes main and navigation landmarks", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("home page images expose non-empty alt text", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `img[${i}] is missing alt text`).toBeTruthy();
    }
  });

  test("login page inputs have associated labels", async ({ page }) => {
    await page.goto("/login");
    const inputs = page.locator("input:not([type='hidden'])");
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const id = await inputs.nth(i).getAttribute("id");
      if (!id) continue;
      await expect(page.locator(`label[for="${id}"]`), `input#${id} has no associated label`).toHaveCount(1);
    }
  });
});
