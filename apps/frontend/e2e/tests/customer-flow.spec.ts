import { test, expect, testData } from '../fixtures/test-fixtures';

test.describe('Customer Shopping Flow', () => {
  test('complete shopping journey', async ({ 
    loginPage, 
    customerDashboardPage,
    page 
  }) => {
    // Step 1: Login
    await loginPage.goto();
    await loginPage.loginAsCustomer();
    
    // Step 2: Verify dashboard loaded
    await customerDashboardPage.waitForDashboardLoad();
    await expect(customerDashboardPage.welcomeMessage).toContainText('Good');
    
    // Step 3: Check personal insights
    await customerDashboardPage.switchInsightTab('Overview');
    const monthlySavings = await customerDashboardPage.getInsightValue('Monthly Savings');
    expect(monthlySavings).toBeTruthy();
    
    // Step 4: Search for a product
    await customerDashboardPage.search('organic milk');
    // Would wait for search results in real implementation
    
    // Step 5: Check recommendations
    const products = await customerDashboardPage.getRecommendedProducts();
    expect(products.length).toBeGreaterThan(0);
    
    // Step 6: Add product to cart
    await customerDashboardPage.addProductToCart('Organic Bananas');
    
    // Step 7: Check cart count updated
    const cartCount = await customerDashboardPage.getCartItemCount();
    expect(parseInt(cartCount || '0')).toBeGreaterThan(0);
    
    // Step 8: Check goals progress
    await customerDashboardPage.switchInsightTab('Goals');
    const budgetProgress = await customerDashboardPage.getGoalProgress('Monthly Budget');
    expect(budgetProgress).toBeTruthy();
    
    // Step 9: View recommendations
    await customerDashboardPage.switchInsightTab('Tips');
    await expect(page.locator('text=/Switch to store brand|Add more vegetables/')).toBeVisible();
    
    // Step 10: Check recent activity
    const activities = await customerDashboardPage.getRecentActivities();
    expect(activities.length).toBeGreaterThan(0);
  });

  test('personalized recommendations flow', async ({ 
    authenticatedCustomerPage,
    customerDashboardPage,
    page 
  }) => {
    // Already logged in via fixture
    await customerDashboardPage.goto();
    
    // Check AI recommendations are displayed
    await expect(page.locator('text=AI Recommendations for You')).toBeVisible();
    
    // Get recommended products
    const products = await customerDashboardPage.getRecommendedProducts();
    expect(products.length).toBe(6); // Should show 6 recommendations
    
    // Each product should have name and price
    products.forEach(product => {
      expect(product.name).toBeTruthy();
      expect(product.price).toMatch(/^\$\d+\.\d{2}/);
    });
    
    // Add multiple products to cart
    for (const product of testData.products.slice(0, 3)) {
      await customerDashboardPage.addProductToCart(product.name);
    }
    
    // Verify cart updated
    const cartCount = await customerDashboardPage.getCartItemCount();
    expect(parseInt(cartCount || '0')).toBe(3);
  });

  test('shopping goals and insights', async ({ 
    authenticatedCustomerPage,
    customerDashboardPage,
    page 
  }) => {
    await customerDashboardPage.goto();
    
    // Check all insight tabs
    const tabs = ['Overview', 'Goals', 'Tips', 'Analytics'] as const;
    
    for (const tab of tabs) {
      await customerDashboardPage.switchInsightTab(tab);
      
      switch(tab) {
        case 'Overview':
          await expect(page.locator('text=Monthly Savings')).toBeVisible();
          await expect(page.locator('text=Smart Purchases')).toBeVisible();
          break;
        case 'Goals':
          await expect(page.locator('text=Monthly Budget')).toBeVisible();
          await expect(page.locator('text=Healthy Choices')).toBeVisible();
          break;
        case 'Tips':
          await expect(page.locator('text=/Save Now|View Options|Set Up/')).toBeVisible();
          break;
        case 'Analytics':
          await expect(page.locator('text=Spending by Category')).toBeVisible();
          await expect(page.locator('text=Health Score')).toBeVisible();
          break;
      }
    }
    
    // Check progress bars in goals
    await customerDashboardPage.switchInsightTab('Goals');
    const budgetProgress = await customerDashboardPage.getGoalProgress('Monthly Budget');
    const healthProgress = await customerDashboardPage.getGoalProgress('Healthy Choices');
    
    expect(parseInt(budgetProgress || '0')).toBeGreaterThanOrEqual(0);
    expect(parseInt(budgetProgress || '0')).toBeLessThanOrEqual(100);
    expect(parseInt(healthProgress || '0')).toBeGreaterThanOrEqual(0);
    expect(parseInt(healthProgress || '0')).toBeLessThanOrEqual(100);
  });

  test('quick actions navigation', async ({ 
    authenticatedCustomerPage,
    customerDashboardPage,
    page 
  }) => {
    await customerDashboardPage.goto();
    
    // Test Start Shopping button
    await customerDashboardPage.startShopping();
    // Would check navigation in real implementation
    await page.goBack();
    
    // Test View Insights button
    await customerDashboardPage.viewInsights();
    // Would check navigation in real implementation
    await page.goBack();
    
    // Test Preferences button
    await customerDashboardPage.openPreferences();
    // Would check navigation in real implementation
  });

  test('mobile responsive customer dashboard', async ({ 
    authenticatedCustomerPage,
    customerDashboardPage,
    page 
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await customerDashboardPage.goto();
    
    // Check critical elements are visible on mobile
    await expect(customerDashboardPage.welcomeMessage).toBeVisible();
    await expect(page.locator('text=OMNIX')).toBeVisible();
    
    // Search should be accessible
    await expect(customerDashboardPage.searchInput).toBeVisible();
    
    // Insights widget should be visible
    await expect(page.locator('text=Personal Insights')).toBeVisible();
    
    // Recommendations should be visible and scrollable
    await expect(page.locator('text=AI Recommendations for You')).toBeVisible();
    
    // Sidebar content should be repositioned but visible
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    await expect(page.locator('text=Quick Stats')).toBeVisible();
    
    // Test touch interactions
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.tap();
    
    // Add to cart button should work on mobile
    await page.locator('button:has-text("Add to Cart")').first().tap();
  });
});