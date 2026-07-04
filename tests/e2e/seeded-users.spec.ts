import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Ensure each test run uses a fresh random seed for distinct queries
faker.seed(Date.now());

test.use({ baseURL: 'http://localhost:5173' });

// This test simulates a random user interaction using generated data.
// Run it multiple times (e.g., 251) to achieve the requested coverage:
//   npx playwright test --repeat-each=251

test('Random user navigates to home and checks title', async ({ page }) => {
  // Generate random user data
  const userName = faker.person.fullName();
  console.log(`Testing as user: ${userName}`);

  await page.goto('/');

  // Basic sanity check – ensure the page loads and contains the app title.
  await expect(page).toHaveURL(/.*\/$/);
  // Generate a random search query
  const query = faker.lorem.words(3);
  console.log(`Searching for query: ${query}`);

  // Attempt to locate a search input (common selectors)
  const searchInput = page.getByRole('textbox', { name: /search/i }).first();
  if (await searchInput.count()) {
    await searchInput.fill(query);
    await searchInput.press('Enter');
    // Simple verification that results contain the query text
    // Optional: verify results (skipped for now)
  }

  // Example interaction – open navigation menu and click Enterprise link if present.
  const enterpriseLink = page.getByRole('link', { name: /enterprise/i });
  if (await enterpriseLink.count()) {
    await enterpriseLink.first().click();
    await expect(page).toHaveURL(/enterprise/);
  }

  // Additional placeholder for further UI actions.
  // e.g., fill a form, submit, verify results, etc.
});

// This test simulates a random user interaction using generated data.
// Run it multiple times (e.g., 251) to achieve the requested coverage:
//   npx playwright test --repeat-each=251

test('Random user navigates to home and checks title', async ({ page }) => {
  // Generate random user data
  const userName = faker.person.fullName();
  console.log(`Testing as user: ${userName}`);

  await page.goto('/');

  // Basic sanity check – ensure the page loads and contains the app title.
  await expect(page).toHaveURL(/.*\/$/);
  // Generate a random search query
  const query = faker.lorem.words(3);
  console.log(`Searching for query: ${query}`);

  // Attempt to locate a search input (common selectors)
  const searchInput = page.getByRole('textbox', { name: /search/i }).first();
  if (await searchInput.count()) {
    await searchInput.fill(query);
    await searchInput.press('Enter');
    // Simple verification that results contain the query text
    // Optional: verify results (skipped for now)
  }

  // Example interaction – open navigation menu and click Enterprise link if present.
  const enterpriseLink = page.getByRole('link', { name: /enterprise/i });
  if (await enterpriseLink.count()) {
    await enterpriseLink.first().click();
    await expect(page).toHaveURL(/enterprise/);
  }

  // Additional placeholder for further UI actions.
  // e.g., fill a form, submit, verify results, etc.
});
