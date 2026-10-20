import { test, expect } from "@playwright/test";

test("home route loads for a synthetic visitor", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*\/$/);
  await expect(page.locator("body")).not.toContainText("Application Error");

  const searchInput = page.getByRole("textbox", { name: /search/i }).first();
  if (await searchInput.count()) {
    await searchInput.fill("test astrology search");
    await searchInput.press("Enter");
  }
});
