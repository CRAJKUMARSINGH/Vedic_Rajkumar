/** Builds one storage state per grade, consumed by the three test projects. */
import { test as setup, expect } from '@playwright/test';
import { GRADES, seedGrade, storageStatePath } from './fixtures/tierSessions';

for (const persona of Object.values(GRADES)) {
  setup(`create storage state — ${persona.label}`, async ({ page, context }) => {
    await seedGrade(page, persona);
    await page.goto('/app');
    await expect(page.locator('body')).not.toContainText('Application Error');
    await context.storageState({ path: storageStatePath(persona.id) });
  });
}
