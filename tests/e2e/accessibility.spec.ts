import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("home page has a main landmark", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("home page has a nav landmark", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `img[${i}] is missing alt text`).not.toBeNull();
    }
  });

  test("login page has no missing label associations", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const inputs = page.locator("input:not([type='hidden'])");
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const id = await inputs.nth(i).getAttribute("id");
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label, `input#${id} has no associated label`).toBeAttached();
      }
    }
  });
});
