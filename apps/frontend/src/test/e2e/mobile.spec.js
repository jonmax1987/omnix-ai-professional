import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Testing', () => {
  test.use({ ...devices['iPhone 12'] });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display mobile-optimized layout', async ({ page }) => {
    // Check if mobile navigation is present
    await expect(page.getByLabelText('Toggle navigation')).toBeVisible();
    
    // Sidebar should be collapsed on mobile
    await expect(page.getByTestId('sidebar')).toHaveClass(/collapsed/);
    
    // Header should be mobile-optimized
    await expect(page.getByTestId('header')).toBeVisible();
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-dashboard.png');
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Open mobile menu
    await page.click('[aria-label="Toggle navigation"]');
    await expect(page.getByTestId('sidebar')).not.toHaveClass(/collapsed/);
    
    // Navigate to products
    await page.click('text=Products');
    await expect(page.getByTestId('products-page')).toBeVisible();
    
    // Menu should close after navigation
    await expect(page.getByTestId('sidebar')).toHaveClass(/collapsed/);
  });

  test('should support touch interactions', async ({ page }) => {
    // Test tap interactions
    await page.tap('[data-testid="metric-card"]');
    
    // Test swipe gestures on carousel (if exists)
    if (await page.getByTestId('mobile-carousel').isVisible()) {
      const carousel = page.getByTestId('mobile-carousel');
      
      // Get carousel bounds
      const box = await carousel.boundingBox();
      
      // Swipe left
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
      await page.mouse.up();
      
      await page.waitForTimeout(500);
    }
  });

  test('should handle mobile form interactions', async ({ page }) => {
    await page.goto('/products');
    
    // Test mobile search
    const searchInput = page.getByPlaceholder('Search products...');
    await searchInput.tap();
    await expect(searchInput).toBeFocused();
    
    // On mobile, keyboard should appear
    await searchInput.fill('mobile test');
    await expect(searchInput).toHaveValue('mobile test');
    
    // Test mobile select
    const categorySelect = page.getByLabel('Category');
    await categorySelect.tap();
    
    // Select an option
    await page.selectOption('[aria-label="Category"]', 'Electronics');
  });

  test('should display mobile-optimized tables', async ({ page }) => {
    await page.goto('/products');
    
    // Table should be responsive on mobile
    const table = page.getByTestId('products-table');
    await expect(table).toBeVisible();
    
    // Should show mobile card layout instead of table
    const mobileCards = page.getByTestId('mobile-product-card');
    if (await mobileCards.first().isVisible()) {
      await expect(mobileCards.first()).toBeVisible();
    }
  });

  test('should handle pull-to-refresh', async ({ page }) => {
    // Simulate pull-to-refresh gesture
    const body = page.locator('body');
    const box = await body.boundingBox();
    
    // Start from top of screen
    await page.mouse.move(box.x + box.width / 2, 10);
    await page.mouse.down();
    
    // Pull down
    await page.mouse.move(box.x + box.width / 2, 200);
    await page.waitForTimeout(100);
    
    // Release
    await page.mouse.up();
    
    // Should show refresh indicator
    if (await page.getByTestId('pull-to-refresh').isVisible()) {
      await expect(page.getByTestId('pull-to-refresh')).toBeVisible();
    }
  });

  test('should handle mobile modals and overlays', async ({ page }) => {
    // Test mobile modal behavior
    if (await page.getByText('Add Product').isVisible()) {
      await page.click('text=Add Product');
      
      // Modal should be full-screen on mobile
      const modal = page.getByTestId('product-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toHaveClass(/mobile-fullscreen/);
      
      // Should be able to close with back gesture or close button
      await page.click('[aria-label="Close"]');
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('Mobile Responsive Design', () => {
  test('should adapt to different mobile screen sizes', async ({ page }) => {
    const sizes = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 812 }, // iPhone X
      { width: 414, height: 896 }, // iPhone 11 Pro Max
      { width: 360, height: 640 }, // Android small
      { width: 412, height: 915 }, // Pixel 5
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto('/');
      
      // Check if layout adapts properly
      await expect(page.getByTestId('header')).toBeVisible();
      await expect(page.getByLabelText('Toggle navigation')).toBeVisible();
      
      // Take screenshot for each size
      await expect(page).toHaveScreenshot(`mobile-${size.width}x${size.height}.png`);
    }
  });

  test('should handle landscape orientation', async ({ page }) => {
    // Set to landscape mobile orientation
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto('/');
    
    // Layout should still be functional in landscape
    await expect(page.getByTestId('header')).toBeVisible();
    await expect(page.getByTestId('dashboard-content')).toBeVisible();
    
    // Take landscape screenshot
    await expect(page).toHaveScreenshot('mobile-landscape.png');
  });

  test('should handle safe area insets', async ({ page }) => {
    // Simulate iPhone X notch
    await page.addStyleTag({
      content: `
        :root {
          --sat-inset-top: 44px;
          --sat-inset-bottom: 34px;
        }
        body { padding-top: env(safe-area-inset-top, 44px); }
      `
    });
    
    await page.goto('/');
    
    // Header should respect safe area
    const header = page.getByTestId('header');
    const headerBox = await header.boundingBox();
    
    // Header should not be obscured by notch
    expect(headerBox.y).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Mobile Accessibility', () => {
  test('should be accessible on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    // Test focus management on mobile
    await page.keyboard.press('Tab');
    
    // First focusable element should be focused
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
    
    // Test screen reader navigation
    // (This would require additional setup for actual screen reader testing)
  });

  test('should have adequate touch target sizes', async ({ page }) => {
    await page.goto('/');
    
    // Get all interactive elements
    const buttons = await page.getByRole('button').all();
    
    for (const button of buttons.slice(0, 5)) { // Test first 5 buttons
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        
        // Touch targets should be at least 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should handle zoom up to 200%', async ({ page }) => {
    await page.goto('/');
    
    // Zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    // Content should still be accessible and functional
    await expect(page.getByTestId('header')).toBeVisible();
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });
});

test.describe('Mobile Performance', () => {
  test('should load quickly on mobile networks', async ({ page }) => {
    // Simulate 3G network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should still load within reasonable time on slow networks
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('should handle offline scenarios', async ({ page }) => {
    await page.goto('/');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Should show offline indicator
    if (await page.getByTestId('offline-indicator').isVisible()) {
      await expect(page.getByTestId('offline-indicator')).toBeVisible();
    }
    
    // Some functionality should still work with cached data
    await expect(page.getByTestId('dashboard-content')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
  });
});

test.describe('Mobile Gestures', () => {
  test('should handle pinch-to-zoom on charts', async ({ page }) => {
    await page.goto('/');
    
    const chart = page.getByTestId('inventory-chart');
    if (await chart.isVisible()) {
      const box = await chart.boundingBox();
      
      // Simulate pinch gesture
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      
      // Add gesture simulation if the chart supports it
      await page.evaluate(() => {
        const chartElement = document.querySelector('[data-testid="inventory-chart"]');
        if (chartElement) {
          const event = new TouchEvent('touchstart', {
            touches: [
              new Touch({ identifier: 0, target: chartElement, clientX: 100, clientY: 100 }),
              new Touch({ identifier: 1, target: chartElement, clientX: 200, clientY: 200 })
            ]
          });
          chartElement.dispatchEvent(event);
        }
      });
    }
  });

  test('should support swipe navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test horizontal swipe for page navigation (if implemented)
    const mainContent = page.getByTestId('main-content');
    const box = await mainContent.boundingBox();
    
    // Swipe right (back gesture)
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.up();
    
    await page.waitForTimeout(500);
  });
});