import { test, expect } from '@playwright/test';

test.describe('Manager Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to manager dashboard for testing
    // In real scenario, would login first
    await page.goto('/manager/dashboard');
  });

  test('should display main dashboard layout', async ({ page }) => {
    await expect(page.locator('text=Manager Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-navigation"]')).toBeVisible();
  });

  test('should show revenue analytics widget', async ({ page }) => {
    await expect(page.locator('text=Revenue Analytics')).toBeVisible();
    await expect(page.locator('text=/Today|This Week|This Month/')).toBeVisible();
    
    // Check for chart container
    const chartContainer = page.locator('[data-testid="revenue-chart"]');
    await expect(chartContainer).toBeVisible();
  });

  test('should display customer segmentation wheel', async ({ page }) => {
    await expect(page.locator('text=Customer Segments')).toBeVisible();
    
    // Check for D3 visualization
    const segmentWheel = page.locator('svg[data-testid="segment-wheel"]');
    await expect(segmentWheel).toBeVisible();
  });

  test('should show inventory health overview', async ({ page }) => {
    await expect(page.locator('text=Inventory Health')).toBeVisible();
    await expect(page.locator('text=/Critical|Low Stock|Optimal|Overstock/')).toBeVisible();
    
    // Check for inventory metrics
    const inventoryMetrics = page.locator('[data-testid="inventory-metric"]');
    await expect(inventoryMetrics.first()).toBeVisible();
  });

  test('should display predictive inventory panel', async ({ page }) => {
    await expect(page.locator('text=Predictive Inventory')).toBeVisible();
    await expect(page.locator('text=/AI Forecast|Confidence Score/')).toBeVisible();
    
    // Check for depletion timeline
    const timeline = page.locator('[data-testid="depletion-timeline"]');
    await expect(timeline).toBeVisible();
  });

  test('should show A/B testing interface', async ({ page }) => {
    await expect(page.locator('text=A/B Testing')).toBeVisible();
    
    // Check for test creation button
    const createTestButton = page.locator('button:has-text("Create New Test")');
    await expect(createTestButton).toBeVisible();
    
    // Check for test results
    await expect(page.locator('text=/Haiku vs Sonnet|Model Performance/')).toBeVisible();
  });

  test('should handle sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('[data-testid="sidebar"]');
    
    // Click on Inventory Management
    await sidebar.locator('text=Inventory').click();
    await expect(page).toHaveURL(/.*\/manager\/inventory/);
    
    // Navigate back to dashboard
    await sidebar.locator('text=Dashboard').click();
    await expect(page).toHaveURL(/.*\/manager\/dashboard/);
    
    // Click on Customer Analytics
    await sidebar.locator('text=Customers').click();
    await expect(page).toHaveURL(/.*\/manager\/customers/);
  });

  test('should display quick actions FAB', async ({ page }) => {
    const fab = page.locator('[data-testid="quick-actions-fab"]');
    await expect(fab).toBeVisible();
    
    // Click FAB to open menu
    await fab.click();
    
    // Check for action items
    await expect(page.locator('text=Add Product')).toBeVisible();
    await expect(page.locator('text=Generate Report')).toBeVisible();
    await expect(page.locator('text=Create Alert')).toBeVisible();
  });

  test('should show business intelligence reports', async ({ page }) => {
    await expect(page.locator('text=Executive Summary')).toBeVisible();
    
    // Check for key metrics
    await expect(page.locator('text=/Revenue Trend|Customer Behavior|Inventory Turnover/')).toBeVisible();
    
    // Check for export functionality
    const exportButton = page.locator('button:has-text("Export Report")');
    await expect(exportButton).toBeVisible();
  });

  test('should display real-time notifications', async ({ page }) => {
    const notificationCenter = page.locator('[data-testid="notification-center"]');
    await expect(notificationCenter).toBeVisible();
    
    // Check for notification items
    await expect(page.locator('text=/Low Stock Alert|New Order|Customer Feedback/')).toBeVisible();
  });

  test('should handle dark mode toggle', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
    
    // Click to switch theme
    await themeToggle.click();
    
    // Check that theme has changed
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-theme', 'dark');
    
    // Click again to switch back
    await themeToggle.click();
    await expect(body).toHaveAttribute('data-theme', 'light');
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Sidebar should be collapsible
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    await expect(sidebarToggle).toBeVisible();
    
    // Click to collapse sidebar
    await sidebarToggle.click();
    
    // Main content should expand
    const mainContent = page.locator('[data-testid="main-content"]');
    await expect(mainContent).toHaveCSS('margin-left', '0px');
  });

  test('should display supplier integration hub', async ({ page }) => {
    await expect(page.locator('text=Supplier Hub')).toBeVisible();
    
    // Check for supplier metrics
    await expect(page.locator('text=/Lead Time|Performance Score|Active Suppliers/')).toBeVisible();
    
    // Check for bulk order button
    const bulkOrderButton = page.locator('button:has-text("Generate Bulk Order")');
    await expect(bulkOrderButton).toBeVisible();
  });
});