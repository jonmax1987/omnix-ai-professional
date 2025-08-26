import { Page, Locator } from '@playwright/test';

export class CustomerDashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly searchInput: Locator;
  readonly notificationButton: Locator;
  readonly cartButton: Locator;
  readonly userProfile: Locator;
  readonly insightsWidget: Locator;
  readonly recommendationsSection: Locator;
  readonly recentActivitySidebar: Locator;
  readonly quickStatsSidebar: Locator;
  readonly shoppingGoalsSidebar: Locator;
  readonly startShoppingButton: Locator;
  readonly viewInsightsButton: Locator;
  readonly preferencesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('h1').filter({ hasText: /Good morning|Good afternoon|Good evening/ });
    this.searchInput = page.locator('input[placeholder*="Search products"]');
    this.notificationButton = page.locator('button[aria-label="Notifications"]');
    this.cartButton = page.locator('button[aria-label="Shopping Cart"]');
    this.userProfile = page.locator('[data-testid="user-profile"]');
    this.insightsWidget = page.locator('text=Personal Insights').locator('..');
    this.recommendationsSection = page.locator('text=AI Recommendations for You').locator('..');
    this.recentActivitySidebar = page.locator('text=Recent Activity').locator('..');
    this.quickStatsSidebar = page.locator('text=Quick Stats').locator('..');
    this.shoppingGoalsSidebar = page.locator('text=Shopping Goals').locator('..');
    this.startShoppingButton = page.locator('button:has-text("Start Shopping")');
    this.viewInsightsButton = page.locator('button:has-text("View Insights")');
    this.preferencesButton = page.locator('button:has-text("Preferences")');
  }

  async goto() {
    await this.page.goto('/customer/dashboard');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async openNotifications() {
    await this.notificationButton.click();
  }

  async openCart() {
    await this.cartButton.click();
  }

  async getNotificationCount() {
    const badge = this.notificationButton.locator('[data-testid="notification-badge"]');
    return await badge.textContent();
  }

  async getCartItemCount() {
    const badge = this.cartButton.locator('[data-testid="cart-badge"]');
    return await badge.textContent();
  }

  async switchInsightTab(tabName: 'Overview' | 'Goals' | 'Tips' | 'Analytics') {
    await this.insightsWidget.locator(`button:has-text("${tabName}")`).click();
  }

  async getInsightValue(insightName: string) {
    const insightCard = this.insightsWidget.locator(`text=${insightName}`).locator('..');
    return await insightCard.locator('[data-testid="insight-value"]').textContent();
  }

  async addProductToCart(productName: string) {
    const productCard = this.recommendationsSection.locator(`text=${productName}`).locator('..');
    await productCard.locator('button:has-text("Add to Cart")').click();
  }

  async getRecommendedProducts() {
    const products = await this.recommendationsSection.locator('[data-testid="product-card"]').all();
    return Promise.all(products.map(async (product) => {
      return {
        name: await product.locator('[data-testid="product-name"]').textContent(),
        price: await product.locator('[data-testid="product-price"]').textContent()
      };
    }));
  }

  async getRecentActivities() {
    const activities = await this.recentActivitySidebar.locator('[data-testid="activity-item"]').all();
    return Promise.all(activities.map(async (activity) => {
      return await activity.textContent();
    }));
  }

  async getQuickStat(statName: string) {
    const statRow = this.quickStatsSidebar.locator(`text=${statName}`).locator('..');
    return await statRow.locator('[data-testid="stat-value"]').textContent();
  }

  async getGoalProgress(goalName: string) {
    const goalRow = this.shoppingGoalsSidebar.locator(`text=${goalName}`).locator('..');
    const progressBar = goalRow.locator('[role="progressbar"]');
    return await progressBar.getAttribute('aria-valuenow');
  }

  async startShopping() {
    await this.startShoppingButton.click();
  }

  async viewInsights() {
    await this.viewInsightsButton.click();
  }

  async openPreferences() {
    await this.preferencesButton.click();
  }

  async isWelcomeMessageVisible() {
    return await this.welcomeMessage.isVisible();
  }

  async waitForDashboardLoad() {
    await this.welcomeMessage.waitFor({ state: 'visible' });
    await this.insightsWidget.waitFor({ state: 'visible' });
    await this.recommendationsSection.waitFor({ state: 'visible' });
  }
}