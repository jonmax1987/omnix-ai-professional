import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render dashboard correctly across all browsers', async ({ page }) => {
    // Check if main elements are visible
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByTestId('metrics-grid')).toBeVisible();
    await expect(page.getByTestId('charts-container')).toBeVisible();
    
    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('dashboard-full.png');
  });

  test('should handle navigation consistently', async ({ page }) => {
    // Test sidebar navigation
    await page.click('text=Products');
    await expect(page.getByTestId('products-page')).toBeVisible();
    
    await page.click('text=Settings');
    await expect(page.getByTestId('settings-page')).toBeVisible();
    
    await page.click('text=Dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('should handle form interactions correctly', async ({ page }) => {
    await page.goto('/products');
    
    // Search functionality
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.fill('test product');
    await expect(searchInput).toHaveValue('test product');
    
    // Filter functionality
    const categorySelect = page.getByLabel('Category');
    await categorySelect.selectOption('Electronics');
    await expect(categorySelect).toHaveValue('Electronics');
  });

  test('should display charts and visualizations', async ({ page }) => {
    // Check if charts render
    await expect(page.getByTestId('inventory-chart')).toBeVisible();
    await expect(page.getByTestId('category-chart')).toBeVisible();
    
    // Wait for chart animations to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot of charts
    await expect(page.getByTestId('charts-container')).toHaveScreenshot('charts-rendered.png');
  });

  test('should handle responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('sidebar')).not.toHaveClass(/collapsed/);
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Mobile menu should be present
    await expect(page.getByLabelText('Toggle navigation')).toBeVisible();
  });

  test('should handle CSS animations and transitions', async ({ page }) => {
    // Test page transition
    await page.click('text=Products');
    
    // Wait for transition to complete
    await page.waitForTimeout(500);
    await expect(page.getByTestId('products-page')).toBeVisible();
    
    // Test modal/dialog animations
    if (await page.getByText('Add Product').isVisible()) {
      await page.click('text=Add Product');
      await expect(page.getByTestId('product-modal')).toBeVisible();
    }
  });

  test('should handle user interactions consistently', async ({ page }) => {
    // Test button clicks
    const buttons = await page.getByRole('button').all();
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const button = buttons[i];
      if (await button.isVisible() && await button.isEnabled()) {
        await button.click();
        // Brief pause between clicks
        await page.waitForTimeout(200);
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Test Enter key on focused element
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });

  test('should handle focus management', async ({ page }) => {
    // Test search input focus
    await page.click('[data-testid="search-input"]');
    await expect(page.getByTestId('search-input')).toBeFocused();
    
    // Test modal focus trap (if modal exists)
    if (await page.getByTestId('modal-trigger').isVisible()) {
      await page.click('[data-testid="modal-trigger"]');
      await expect(page.getByTestId('modal')).toBeVisible();
      
      // First focusable element should be focused
      const firstInput = page.getByTestId('modal').getByRole('textbox').first();
      if (await firstInput.isVisible()) {
        await expect(firstInput).toBeFocused();
      }
    }
  });
});

test.describe('Browser-Specific Features', () => {
  test('should handle browser-specific CSS features', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Check for CSS Grid support
    const gridSupported = await page.evaluate(() => {
      return CSS.supports('display', 'grid');
    });
    expect(gridSupported).toBeTruthy();
    
    // Check for Flexbox support
    const flexSupported = await page.evaluate(() => {
      return CSS.supports('display', 'flex');
    });
    expect(flexSupported).toBeTruthy();
    
    // Browser-specific tests
    if (browserName === 'webkit') {
      // Safari-specific tests
      const webkitTransformSupported = await page.evaluate(() => {
        return CSS.supports('-webkit-transform', 'translateX(10px)');
      });
      expect(webkitTransformSupported).toBeTruthy();
    }
  });

  test('should handle JavaScript API compatibility', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Test for modern JS features
    const features = await page.evaluate(() => {
      return {
        fetch: typeof fetch !== 'undefined',
        promise: typeof Promise !== 'undefined',
        arrow: (() => true)() === true,
        const: (() => { const x = 1; return x === 1; })(),
        let: (() => { let x = 1; return x === 1; })(),
        templateLiterals: `test ${1}` === 'test 1'
      };
    });
    
    Object.values(features).forEach(feature => {
      expect(feature).toBeTruthy();
    });
  });

  test('should handle local storage consistently', async ({ page }) => {
    await page.goto('/');
    
    // Test localStorage
    await page.evaluate(() => {
      localStorage.setItem('test', 'value');
    });
    
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test');
    });
    
    expect(storedValue).toBe('value');
    
    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('test');
    });
  });
});

test.describe('Visual Regression Tests', () => {
  test('should maintain visual consistency across browsers', async ({ page }) => {
    await page.goto('/');
    
    // Wait for all content to load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('full-page.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('should render components consistently', async ({ page }) => {
    await page.goto('/');
    
    // Screenshot individual components
    await expect(page.getByTestId('header')).toHaveScreenshot('header-component.png');
    await expect(page.getByTestId('sidebar')).toHaveScreenshot('sidebar-component.png');
    await expect(page.getByTestId('metrics-grid')).toHaveScreenshot('metrics-grid.png');
  });
});

test.describe('Performance Across Browsers', () => {
  test('should load within acceptable time on all browsers', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds across all browsers
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-row"]');
    
    // Measure scroll performance
    const startTime = Date.now();
    await page.keyboard.press('End'); // Scroll to bottom
    await page.waitForTimeout(100);
    const scrollTime = Date.now() - startTime;
    
    expect(scrollTime).toBeLessThan(1000);
  });
});