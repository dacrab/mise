import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the hero and search controls", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /recipes made/i })).toBeVisible();
    await expect(page.getByPlaceholder(/what are you craving\?/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /search/i })).toBeVisible();
  });

  test("can navigate to the about page from the footer", async ({ page }) => {
    await page.getByRole("link", { name: /^about$/i }).last().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole("heading", { level: 1, name: /a place for home cooks/i })).toBeVisible();
  });

  test("shows an empty-state message for a unique search with no matches", async ({ page }) => {
    await page.getByPlaceholder(/what are you craving\?/i).fill("zzqv-no-match-unique-query");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page.getByRole("heading", { level: 2, name: /no recipes found/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /clear search/i })).toBeVisible();
  });
});
