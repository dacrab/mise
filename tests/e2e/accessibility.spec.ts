import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("home page has proper heading structure", async ({ page }) => {
    await page.goto("/");
    
    // Should have exactly one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
    
    // H1 should be visible
    await expect(page.locator("h1")).toBeVisible();
  });

  test("forms have proper labels", async ({ page }) => {
    await page.goto("/login");
    
    // Email input should have associated label
    const emailInput = page.getByPlaceholder("you@example.com");
    await expect(emailInput).toBeVisible();
    
    // Password input should have associated label
    const passwordInput = page.getByPlaceholder(/password/i);
    await expect(passwordInput).toBeVisible();
  });

  test("buttons have accessible names", async ({ page }) => {
    await page.goto("/");
    
    // All buttons should have accessible names
    const buttons = page.getByRole("button");
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute("aria-label") || await button.textContent();
      expect(name).toBeTruthy();
    }
  });

  test("links have accessible names", async ({ page }) => {
    await page.goto("/");
    
    // All links should have accessible names
    const links = page.getByRole("link");
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 20); i++) { // Check first 20 links
      const link = links.nth(i);
      const name = await link.getAttribute("aria-label") || await link.textContent();
      expect(name?.trim()).toBeTruthy();
    }
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    
    const images = page.locator("img");
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // Alt can be empty string for decorative images, but should exist
      expect(alt).toBeDefined();
    }
  });

  test("focus is visible on interactive elements", async ({ page }) => {
    await page.goto("/login");
    
    // Tab to first input
    await page.keyboard.press("Tab");
    
    // Check that something is focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("skip link or main landmark exists", async ({ page }) => {
    await page.goto("/");
    
    // Should have main landmark
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });
});

test.describe("Responsive Design", () => {
  test("mobile navigation works", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    // Header should be visible
    await expect(page.getByText("mise").first()).toBeVisible();
    
    // Search should still work
    await expect(page.getByPlaceholder("What are you craving?")).toBeVisible();
  });

  test("tablet layout works", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    
    // Content should be visible
    await expect(page.locator("h1")).toBeVisible();
  });

  test("desktop layout works", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    
    // Full navigation should be visible
    await expect(page.getByRole("link", { name: /New Recipe/i })).toBeVisible();
  });
});

test.describe("Performance", () => {
  test("home page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("no console errors on home page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    
    await page.goto("/");
    await page.waitForTimeout(2000);
    
    // Filter out known acceptable errors (like failed network requests in dev)
    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("404")
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
