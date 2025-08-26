import { test, expect } from '@playwright/test';

test.describe('Customer Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to customer dashboard for testing
    // In real scenario, would login first
    await page.goto('/customer/dashboard');
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('text=/Good morning|Good afternoon|Good evening/')).toBeVisible();
    await expect(page.locator('text=/Your AI shopping assistant/')).toBeVisible();
  });

  test('should show personal insights widget', async ({ page }) => {
    await expect(page.locator('text=Personal Insights')).toBeVisible();
    await expect(page.locator('text=Monthly Savings')).toBeVisible();
    await expect(page.locator('text=Smart Purchases')).toBeVisible();
    await expect(page.locator('text=Goals Met')).toBeVisible();
    await expect(page.locator('text=Health Score')).toBeVisible();
  });

  test('should display AI recommendations', async ({ page }) => {
    await expect(page.locator('text=AI Recommendations for You')).toBeVisible();
    
    // Check for product cards
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount(6);
    
    // Check first product card has required elements
    const firstCard = productCards.first();
    await expect(firstCard.locator('button:has-text("Add to Cart")')).toBeVisible();
  });

  test('should show recent activity sidebar', async ({ page }) => {
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    
    // Check for activity items
    const activityItems = page.locator('[data-testid="activity-item"]');
    await expect(activityItems.first()).toBeVisible();
  });

  test('should display quick stats', async ({ page }) => {
    await expect(page.locator('text=Quick Stats')).toBeVisible();
    await expect(page.locator('text=This Month')).toBeVisible();
    await expect(page.locator('text=Orders')).toBeVisible();
    await expect(page.locator('text=Favorites')).toBeVisible();
    await expect(page.locator('text=Rewards')).toBeVisible();
  });

  test('should show shopping goals progress', async ({ page }) => {
    await expect(page.locator('text=Shopping Goals')).toBeVisible();
    await expect(page.locator('text=Monthly Budget')).toBeVisible();
    await expect(page.locator('text=Healthy Choices')).toBeVisible();
    
    // Check for progress bars
    const progressBars = page.locator('[role="progressbar"]');
    await expect(progressBars).toHaveCount(2);
  });

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search products"]');
    await expect(searchInput).toBeVisible();
    
    // Type in search
    await searchInput.fill('organic milk');
    await searchInput.press('Enter');
    
    // Would check for search results in real implementation
  });

  test('should display notification badge', async ({ page }) => {
    const notificationButton = page.locator('button[aria-label="Notifications"]');
    await expect(notificationButton).toBeVisible();
    
    // Check for badge count
    const badge = notificationButton.locator('[data-testid="notification-badge"]');
    await expect(badge).toBeVisible();
  });

  test('should show shopping cart indicator', async ({ page }) => {
    const cartButton = page.locator('button[aria-label="Shopping Cart"]');
    await expect(cartButton).toBeVisible();
    
    // Check for item count badge
    const badge = cartButton.locator('[data-testid="cart-badge"]');
    await expect(badge).toBeVisible();
  });

  test('should navigate to different tabs in insights widget', async ({ page }) => {
    // Click on Goals tab
    await page.click('button:has-text("Goals")');
    await expect(page.locator('text=Monthly Budget')).toBeVisible();
    
    // Click on Tips tab
    await page.click('button:has-text("Tips")');
    await expect(page.locator('text=/Switch to store brand|Add more vegetables/')).toBeVisible();
    
    // Click on Analytics tab
    await page.click('button:has-text("Analytics")');
    await expect(page.locator('text=Spending by Category')).toBeVisible();
    
    // Return to Overview
    await page.click('button:has-text("Overview")');
    await expect(page.locator('text=Monthly Savings')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that main elements are still visible
    await expect(page.locator('text=OMNIX')).toBeVisible();
    await expect(page.locator('text=/Good morning|Good afternoon|Good evening/')).toBeVisible();
    
    // Sidebar should be repositioned on mobile
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('should handle quick action buttons', async ({ page }) => {
    // Click Start Shopping button
    await page.click('button:has-text("Start Shopping")');
    // Would navigate to shopping page in real implementation
    
    // Go back to dashboard
    await page.goBack();
    
    // Click View Insights button
    await page.click('button:has-text("View Insights")');
    // Would navigate to insights page in real implementation
    
    // Go back to dashboard
    await page.goBack();
    
    // Click Preferences button
    await page.click('button:has-text("Preferences")');
    // Would navigate to preferences page in real implementation
  });
});