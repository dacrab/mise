import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("displays hero section and search", async ({ page }) => {
    await page.goto("/");
    
    // Hero section
    await expect(page.locator("h1")).toContainText("Recipes made");
    await expect(page.getByText("from our kitchen to yours")).toBeVisible();
    
    // Search form
    await expect(page.getByPlaceholder("What are you craving?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });

  test("search filters recipes", async ({ page }) => {
    await page.goto("/");
    
    // Enter search query
    await page.getByPlaceholder("What are you craving?").fill("pasta");
    await page.getByRole("button", { name: "Search" }).click();
    
    // URL should update
    await expect(page).toHaveURL(/\?q=pasta/);
    
    // Results section should show
    await expect(page.getByText(/result/i)).toBeVisible();
  });

  test("category filter works", async ({ page }) => {
    await page.goto("/");
    
    // Open category dropdown and select
    await page.getByText("All categories").click();
    await page.getByText("Breakfast").click();
    await page.getByRole("button", { name: "Search" }).click();
    
    // URL should update
    await expect(page).toHaveURL(/category=Breakfast/);
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    
    // Click on logo to go home
    await page.getByText("mise").first().click();
    await expect(page).toHaveURL("/");
    
    // New Recipe button
    await page.getByRole("link", { name: /New Recipe/i }).click();
    await expect(page).toHaveURL(/login|dashboard\/create/);
  });
});

test.describe("Footer", () => {
  test("displays footer links", async ({ page }) => {
    await page.goto("/");
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer links
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Terms" })).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText("A place for home cooks")).toBeVisible();
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByText("Privacy Policy")).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByText("Terms of Service")).toBeVisible();
  });
});
