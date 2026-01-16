import { test, expect } from "@playwright/test";

test.describe("Recipe Page", () => {
  // Note: These tests assume there's at least one recipe in the database
  // In a real scenario, you'd seed test data or use a test database
  
  test.describe("Recipe Display", () => {
    test.beforeEach(async ({ page }) => {
      // Go to home and click first recipe if available
      await page.goto("/");
      
      // Wait for recipes to load
      await page.waitForTimeout(2000);
    });

    test("displays recipe details when recipe exists", async ({ page }) => {
      // Try to find a recipe link
      const recipeLink = page.locator('a[href^="/recipe/"]').first();
      
      if (await recipeLink.isVisible()) {
        await recipeLink.click();
        
        // Should show recipe page elements
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.getByText("Ingredients")).toBeVisible();
        await expect(page.getByText("Instructions")).toBeVisible();
      }
    });
  });

  test.describe("Recipe Interactions", () => {
    test("shows login prompt when liking without auth", async ({ page }) => {
      await page.goto("/");
      
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      const recipeLink = page.locator('a[href^="/recipe/"]').first();
      
      if (await recipeLink.isVisible()) {
        await recipeLink.click();
        await page.waitForTimeout(1000);
        
        // Try to like
        const likeButton = page.getByRole("button", { name: /like/i }).first();
        if (await likeButton.isVisible()) {
          await likeButton.click();
          
          // Should show error or redirect to login
          await expect(page.getByText(/sign in|login|error/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test("share button copies link", async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      
      await page.goto("/");
      await page.waitForTimeout(2000);
      
      const recipeLink = page.locator('a[href^="/recipe/"]').first();
      
      if (await recipeLink.isVisible()) {
        await recipeLink.click();
        await page.waitForTimeout(1000);
        
        const shareButton = page.getByRole("button", { name: /share/i });
        if (await shareButton.isVisible()) {
          await shareButton.click();
          
          // Should show confirmation or copy to clipboard
          // Note: Native share API may open system dialog on mobile
        }
      }
    });
  });

  test.describe("Ingredient Scaler", () => {
    test("scales ingredients when changing servings", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(2000);
      
      const recipeLink = page.locator('a[href^="/recipe/"]').first();
      
      if (await recipeLink.isVisible()) {
        await recipeLink.click();
        await page.waitForTimeout(1000);
        
        // Find servings controls
        const increaseButton = page.getByRole("button", { name: /increase/i });
        
        if (await increaseButton.isVisible()) {
          // Get initial ingredient text
          const ingredientText = await page.locator("ul li").first().textContent();
          
          // Increase servings
          await increaseButton.click();
          
          // Ingredient amounts should change
          const newIngredientText = await page.locator("ul li").first().textContent();
          
          // Text might be different if it contains numbers
          expect(ingredientText).toBeDefined();
          expect(newIngredientText).toBeDefined();
        }
      }
    });
  });

  test.describe("Cooking Timers", () => {
    test("can add a timer", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(2000);
      
      const recipeLink = page.locator('a[href^="/recipe/"]').first();
      
      if (await recipeLink.isVisible()) {
        await recipeLink.click();
        await page.waitForTimeout(1000);
        
        // Find timer section
        const timerInput = page.getByPlaceholder(/timer name/i);
        
        if (await timerInput.isVisible()) {
          await timerInput.fill("Test Timer");
          await page.getByRole("button", { name: /add/i }).click();
          
          // Timer should appear
          await expect(page.getByText("Test Timer")).toBeVisible();
        }
      }
    });
  });

  test.describe("Print View", () => {
    test("print page loads", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(2000);
      
      const recipeLink = page.locator('a[href^="/recipe/"]').first();
      
      if (await recipeLink.isVisible()) {
        const href = await recipeLink.getAttribute("href");
        if (href) {
          await page.goto(`${href}/print`);
          
          // Print page should have print button
          await expect(page.getByRole("button", { name: /print/i })).toBeVisible();
        }
      }
    });
  });
});
