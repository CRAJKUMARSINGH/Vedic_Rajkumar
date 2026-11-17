# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: robustness-random-birth.spec.ts >> Robustness — random birth data >> horoscope renders for random birth 4: Rohan Iyer (17/11/2007 12:05)
- Location: tests\e2e\robustness-random-birth.spec.ts:201:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Overall Score|समग्र स्कोर/).first()
Expected: visible
Timeout: 45000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 45000ms
  - waiting for getByText(/Overall Score|समग्र स्कोर/).first()

```

```yaml
- region "Notifications alt+T"
- text: PROTOTYPE Vedic Rajkumar — Preview Build The product is actively being refined. Astrological results are for educational reference — consult a qualified astrologer before making life decisions.
- link "Validation Progress":
    - /url: /validation
    - button "Validation Progress"
- button "Dismiss banner"
- text: "Free plan: 3 questions/day · Upgrade to Pro for unlimited access"
- link "₹499/mo — Upgrade":
    - /url: /pricing
    - button "₹499/mo — Upgrade"
- button
- navigation "Main navigation":
    - link "Vedic Rajkumar Home Workspace":
        - /url: /app
        - text: Vedic Rajkumar
    - menubar:
        - link "Kundli":
            - /url: /horoscope
            - button "Kundli"
        - link "Prashna AI":
            - /url: /prashna
            - button "Prashna AI"
        - link "Kundli Milan":
            - /url: /matchmaking
            - button "Kundli Milan"
        - link "Panchang":
            - /url: /panchang
            - button "Panchang"
        - link "Labs — all preview modules":
            - /url: /features
            - button "Labs Preview"
    - button "हिंदी भाषा में बदलें": हिं
    - button "Profile"
    - button "☀️"
- main:
    - navigation "Breadcrumb":
        - link "Home":
            - /url: /
        - text: Horoscope
    - text: 🌙
    - heading "Horoscope" [level=1]
    - paragraph: Daily / Weekly / Monthly
    - link "Home":
        - /url: /
    - button "Family Profile — Select a family member to fill in birth details": Family Profile
    - button "🇺🇸 English"
    - main:
        - paragraph: Enter your birth date for personalized horoscope
        - text: Form Progress 4/4 Basic Info Time Details Location Submit
        - heading "Enter Birth Details" [level=2]
        - paragraph: DD/MM/YYYY format • Accurate Vedic calculations
        - text: Quick Actions
        - button "Use Today"
        - button "Use Current Time"
        - button "Use Last Location"
        - button "Clear Form"
        - button "Save Profile"
        - text: Saved Profiles
        - combobox: New Entry
        - text: Date of Birth
        - textbox "Date of Birth":
            - /placeholder: DD/MM/YYYY  e.g. 15/09/1963
            - text: 17/11/2007
        - paragraph: ✓ 2007-11-17
        - text: Time of Birth
        - textbox "Time of Birth": 12:05
        - text: Place of Birth
        - combobox "Place of Birth": Jaipur, Rajasthan
        - text: Saved • 08:31 AM Form Complete
        - button "Get Transit Reading"
- button "Shortcuts"
- button "💬 Feedback"
```

# Test source

```ts
  125 | function collectErrors(page: Page): ErrorBucket {
  126 |   const bucket: ErrorBucket = { pageErrors: [], consoleErrors: [] };
  127 |   page.on('pageerror', (err) => bucket.pageErrors.push(err.message));
  128 |   page.on('console', (msg) => {
  129 |     if (msg.type() === 'error') bucket.consoleErrors.push(msg.text());
  130 |   });
  131 |   return bucket;
  132 | }
  133 |
  134 | /** Pre-dismiss the consent banner + seed a fresh local profile so clicks are not intercepted. */
  135 | async function seedStorage(page: Page) {
  136 |   await page.addInitScript(() => {
  137 |     try {
  138 |       localStorage.setItem(
  139 |         'vr-consent',
  140 |         JSON.stringify({ given: false, timestamp: new Date().toISOString(), version: 1 }),
  141 |       );
  142 |     } catch {
  143 |       /* ignore */
  144 |     }
  145 |   });
  146 | }
  147 |
  148 | async function assertNoCrash(page: Page, context: string) {
  149 |   const body = await page.innerText('body');
  150 |   expect(body, `error boundary surfaced on ${context}`).not.toContain('Something went wrong');
  151 |   expect(body, `application error surfaced on ${context}`).not.toContain('Application Error');
  152 | }
  153 |
  154 | // ─── Suite ────────────────────────────────────────────────────────────────────
  155 |
  156 | const report: { generatedAt: string; births: unknown[]; questions: unknown[] } = {
  157 |   generatedAt: new Date().toISOString(),
  158 |   births: [],
  159 |   questions: [],
  160 | };
  161 |
  162 | test.describe.configure({ mode: 'serial' });
  163 |
  164 | test.describe('Robustness — random birth data', () => {
  165 |   const BIRTHS = Array.from({ length: 6 }, () => randomBirth());
  166 |
  167 |   BIRTHS.forEach((birth, i) => {
  168 |     test(`horoscope renders for random birth ${i + 1}: ${birth.name} (${birth.dateDMY} ${birth.time})`, async ({ page }) => {
  169 |       const errors = collectErrors(page);
  170 |       await seedStorage(page);
  171 |
  172 |       await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  173 |       await expect(page.locator('#dob')).toBeVisible({ timeout: 30_000 });
  174 |
  175 |       await page.locator('#dob').fill(birth.dateDMY);
  176 |       await page.locator('#tob').fill(birth.time);
  177 |       await page.locator('#pob').fill(birth.place.label);
  178 |
  179 |       const submit = page.getByRole('button', { name: /Get Transit Reading|गोचर फल देखें/ });
  180 |       await expect(submit).toBeEnabled({ timeout: 10_000 });
  181 |       await submit.click();
  182 |
  183 |       // HoroscopeCard is lazy-loaded and computed from the birth date.
  184 |       await expect(page.getByText(/Overall Score|समग्र स्कोर/).first()).toBeVisible({ timeout: 45_000 });
  185 |
  186 |       await assertNoCrash(page, `horoscope/${i + 1}`);
  187 |       expect(errors.pageErrors, `uncaught page error for ${birth.name}`).toEqual([]);
  188 |
  189 |       await page.screenshot({
  190 |         path: path.join(SHOT_DIR, `birth_${i + 1}.png`),
  191 |         fullPage: true,
  192 |       });
  193 |
  194 |       report.births.push({ ...birth, pageErrors: errors.pageErrors, consoleErrors: errors.consoleErrors });
  195 |     });
  196 |   });
  197 | });
  198 |
  199 | test.describe('Robustness — multidimensional Prashna questions', () => {
  200 |   QUESTIONS.forEach((q) => {
  201 |     test(`prashna verdict for [${q.dimension}]: ${q.text.slice(0, 48)}…`, async ({ page }) => {
  202 |       const errors = collectErrors(page);
  203 |       await seedStorage(page);
  204 |
  205 |       await page.goto('/question', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  206 |
  207 |       const textarea = page.locator('textarea').first();
  208 |       await expect(textarea).toBeVisible({ timeout: 30_000 });
  209 |       await textarea.fill(q.text);
  210 |
  211 |       // Main engine submit button (distinct from the standalone research bar).
  212 |       const submit = page.getByRole('button', { name: /Get Phaladesh|फलादेश पाएं/ });
  213 |       await expect(submit).toBeEnabled({ timeout: 10_000 });
  214 |       await submit.click();
  215 |
  216 |       // Result region (aria-label set on the results container).
  217 |       const result = page.locator('[aria-label="Prashna analysis result"], [aria-label="प्रश्न विश्लेषण परिणाम"]');
  218 |       await expect(result).toBeVisible({ timeout: 45_000 });
  219 |       await expect(result.getByText(/Score|अंक/).first()).toBeVisible({ timeout: 15_000 });
  220 |
  221 |       await assertNoCrash(page, `question/${q.dimension}`);
  222 |       expect(errors.pageErrors, `uncaught page error for [${q.dimension}]`).toEqual([]);
  223 |
  224 |       const verdictText = (await result.innerText()).slice(0, 400);
> 225 |
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  226 |       await page.screenshot({
  227 |         path: path.join(SHOT_DIR, `question_${q.dimension}.png`),
  228 |         fullPage: true,
  229 |       });
  230 |
  231 |       report.questions.push({
  232 |         dimension: q.dimension,
  233 |         question: q.text,
  234 |         verdictExcerpt: verdictText,
  235 |         pageErrors: errors.pageErrors,
  236 |         consoleErrors: errors.consoleErrors,
  237 |       });
  238 |     });
  239 |   });
  240 | });
  241 |
  242 | test.afterAll(async () => {
  243 |   fs.writeFileSync(path.join(REPORT_DIR, 'report.json'), JSON.stringify(report, null, 2), 'utf-8');
  244 | });
  245 |
```
