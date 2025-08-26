import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CustomerDashboardPage } from '../pages/CustomerDashboardPage';

// Define custom fixtures
type MyFixtures = {
  loginPage: LoginPage;
  customerDashboardPage: CustomerDashboardPage;
  authenticatedManagerPage: void;
  authenticatedCustomerPage: void;
};

// Extend base test with custom fixtures
export const test = base.extend<MyFixtures>({
  // Page object fixtures
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  customerDashboardPage: async ({ page }, use) => {
    const dashboardPage = new CustomerDashboardPage(page);
    await use(dashboardPage);
  },

  // Authenticated fixtures
  authenticatedManagerPage: [async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');
    
    // Login as manager
    await page.fill('input[type="email"]', 'manager@omnix.ai');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/manager/dashboard');
    
    // Use the authenticated page
    await use();
  }, { auto: false }],

  authenticatedCustomerPage: [async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');
    
    // Login as customer
    await page.fill('input[type="email"]', 'customer@example.com');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/customer/dashboard');
    
    // Use the authenticated page
    await use();
  }, { auto: false }],
});

export { expect } from '@playwright/test';

// Helper functions for common test scenarios
export const testData = {
  manager: {
    email: 'manager@omnix.ai',
    password: 'Test123!@#',
    name: 'John Manager'
  },
  customer: {
    email: 'customer@example.com',
    password: 'Test123!@#',
    name: 'Sarah Customer'
  },
  products: [
    { name: 'Organic Bananas', price: '$3.99', category: 'Produce' },
    { name: 'Almond Milk', price: '$4.49', category: 'Dairy Alternative' },
    { name: 'Greek Yogurt', price: '$5.99', category: 'Dairy' },
    { name: 'Whole Grain Bread', price: '$3.79', category: 'Bakery' },
    { name: 'Fresh Spinach', price: '$2.99', category: 'Produce' },
    { name: 'Olive Oil', price: '$8.99', category: 'Pantry' }
  ]
};

// Utility function to wait for API calls
export async function waitForAPI(page: any, endpoint: string) {
  return page.waitForResponse((response: any) => 
    response.url().includes(endpoint) && response.status() === 200
  );
}

// Utility function to mock API responses
export async function mockAPIResponse(page: any, endpoint: string, data: any) {
  await page.route(`**/${endpoint}`, (route: any) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data)
    });
  });
}

// Utility function to check accessibility
export async function checkAccessibility(page: any) {
  // This would integrate with axe-core or similar
  // For now, basic checks
  const title = await page.title();
  if (!title) {
    throw new Error('Page has no title');
  }
  
  const h1 = await page.locator('h1').first();
  if (!await h1.isVisible()) {
    throw new Error('Page has no visible H1');
  }
}