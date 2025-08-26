import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    // Check for login form elements
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should allow manager login', async ({ page }) => {
    // Fill in login form
    await page.fill('input[type="email"]', 'manager@omnix.ai');
    await page.fill('input[type="password"]', 'Test123!@#');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to manager dashboard
    await page.waitForURL('**/manager/dashboard');
    
    // Verify manager dashboard elements
    await expect(page.locator('text=Manager Dashboard')).toBeVisible();
  });

  test('should allow customer login', async ({ page }) => {
    // Fill in login form
    await page.fill('input[type="email"]', 'customer@example.com');
    await page.fill('input[type="password"]', 'Test123!@#');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to customer dashboard
    await page.waitForURL('**/customer/dashboard');
    
    // Verify customer dashboard elements
    await expect(page.locator('text=OMNIX')).toBeVisible();
  });

  test('should show validation errors for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    // Click forgot password link
    await page.click('text=Forgot Password?');
    
    // Fill in email for password reset
    await page.fill('input[type="email"]', 'user@example.com');
    await page.click('button:has-text("Send Reset Link")');
    
    // Check for success message
    await expect(page.locator('text=Password reset link sent')).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click sign up link
    await page.click('text=Sign Up');
    
    // Verify registration form elements
    await expect(page.locator('text=Create Account')).toBeVisible();
    await expect(page.locator('input[placeholder*="First Name"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Last Name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should maintain session after page refresh', async ({ page, context }) => {
    // Login first
    await page.fill('input[type="email"]', 'manager@omnix.ai');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    
    // Wait for successful login
    await page.waitForURL('**/manager/dashboard');
    
    // Refresh the page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL(/.*\/manager\/dashboard/);
    await expect(page.locator('text=Manager Dashboard')).toBeVisible();
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'manager@omnix.ai');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/manager/dashboard');
    
    // Click logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});