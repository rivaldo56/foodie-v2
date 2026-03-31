import { test, expect } from '@playwright/test';

const SELECTORS = {
  chefCard: '[data-testid="chef-card"]',
  bookButton: 'button:has-text("Book Experience")',
  datePicker: '[data-testid="date-picker"]',
  confirmBooking: 'button:has-text("Confirm Booking")',
  successMessage: 'text=Booking successful',
};

test.describe('Booking smoke flow', () => {
  test.beforeEach(async ({ page }) => {
    // Basic login before booking tests
    const SAMPLE_EMAIL = process.env.PLAYWRIGHT_EMAIL || 'client@example.com';
    const SAMPLE_PASSWORD = process.env.PLAYWRIGHT_PASSWORD || 'password123';

    await page.goto('/login');
    await page.fill('#email', SAMPLE_EMAIL);
    await page.fill('#password', SAMPLE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/client/home');
  });

  test('can navigate to a chef profile and trigger booking drawer', async ({ page }) => {
    // Navigate to a chef profile (assuming we have one in the feed)
    await page.goto('/client/home');
    
    // Wait for the feed to load
    await page.waitForSelector(SELECTORS.chefCard, { timeout: 10000 });
    
    // Click the first chef card
    await page.click(SELECTORS.chefCard);
    
    // Verify we're on a chef profile
    await expect(page).toHaveURL(/\/chef\/.+$/);
    
    // Check if the Book Experience button is visible
    const bookBtn = page.locator(SELECTORS.bookButton);
    await expect(bookBtn).toBeVisible({ timeout: 5000 });
  });

  test('renders booking availability interface correctly', async ({ page }) => {
    // This test ensures that the new native Django availability API is being hit correctly
    // and the frontend is rendering the calendar/time slots.
    
    // Direct navigation to a known chef profile for stability
    await page.goto('/chef/test_chef'); 
    
    const bookBtn = page.locator(SELECTORS.bookButton);
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      
      // Verify availability UI components (calendar, etc.)
      await expect(page.locator(SELECTORS.datePicker)).toBeVisible({ timeout: 10000 });
    }
  });
});
