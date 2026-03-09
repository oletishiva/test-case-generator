/* ─── Interview Prep Question Bank ─────────────────────────────────────────
   Comprehensive QA + Playwright interview questions.
   Categories, difficulties, experience levels, language filters.
──────────────────────────────────────────────────────────────────────────── */

export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "very-hard"
  | "logical"
  | "design"
  | "leadership";

export type ExperienceLevel = "junior" | "mid" | "senior" | "lead";
export type Language = "typescript" | "javascript" | "python" | "java" | "any";

export interface Question {
  id: string;
  question: string;
  answer: string;
  code?: string;
  language?: Language;
  difficulty: Difficulty;
  experience: ExperienceLevel[];
  category: string;
  tags: string[];
}

export const CATEGORIES = [
  "Playwright Basics",
  "Locators & Selectors",
  "Page Object Model",
  "Fixtures & Config",
  "API Testing",
  "Visual Testing",
  "CI/CD & Reporting",
  "Debugging",
  "Python (Playwright)",
  "Java (Playwright)",
  "Framework Design",
  "QA Fundamentals",
  "Behavioral & Leadership",
] as const;

export const QUESTIONS: Question[] = [

  /* ══════════════════════════════════════════════════════
     PLAYWRIGHT BASICS — TypeScript / JavaScript
  ══════════════════════════════════════════════════════ */
  {
    id: "pw-1",
    question: "What is Playwright and how does it differ from Selenium WebDriver?",
    answer:
      "Playwright is a Microsoft-maintained end-to-end testing framework that controls Chromium, Firefox and WebKit through a unified API. Key differences from Selenium:\n\n" +
      "• **Auto-waiting**: Playwright automatically waits for elements to be actionable (visible, stable, enabled) before interactions — no explicit `waitForElement` calls needed.\n" +
      "• **Multiple browsers in one install**: A single `npm install` pulls all three browser engines.\n" +
      "• **Network interception**: Native `page.route()` API to mock/intercept requests without third-party tools.\n" +
      "• **Browser contexts**: Lightweight isolated sessions within one browser instance — faster than Selenium's new driver per test.\n" +
      "• **Trace viewer**: Built-in HTML report with video, screenshots, and network logs.\n" +
      "• **TypeScript-first**: First-class TS types out of the box.\n\n" +
      "Selenium uses the W3C WebDriver protocol (HTTP round-trips); Playwright communicates directly over CDP/browser DevTools Protocol, making it generally faster.",
    difficulty: "easy",
    experience: ["junior", "mid"],
    category: "Playwright Basics",
    tags: ["playwright", "selenium", "comparison", "webdriver"],
  },
  {
    id: "pw-2",
    question: "How do you install Playwright and create a basic test?",
    answer:
      "Run `npm init playwright@latest` which scaffolds the project, installs browsers and creates a `playwright.config.ts`.\n\nA minimal test:",
    code:
      `import { test, expect } from '@playwright/test';

test('page title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});`,
    language: "typescript",
    difficulty: "easy",
    experience: ["junior"],
    category: "Playwright Basics",
    tags: ["setup", "installation", "first test"],
  },
  {
    id: "pw-3",
    question: "What are the different built-in locator strategies in Playwright and which should you prefer?",
    answer:
      "Playwright provides these locator methods (in recommended priority order):\n\n" +
      "1. **`getByRole()`** – semantic ARIA role, most resilient to HTML changes\n" +
      "2. **`getByLabel()`** – form inputs by associated label text\n" +
      "3. **`getByPlaceholder()`** – inputs with a placeholder attribute\n" +
      "4. **`getByText()`** – elements by visible text\n" +
      "5. **`getByAltText()`** – images by alt attribute\n" +
      "6. **`getByTitle()`** – elements by title attribute\n" +
      "7. **`getByTestId()`** – elements with `data-testid`\n" +
      "8. **`locator()`** – fallback CSS / XPath\n\n" +
      "Prefer semantic locators because they test user-facing behaviour, survive refactoring, and improve accessibility.",
    code:
      `// Preferred: role-based
await page.getByRole('button', { name: 'Submit' }).click();

// Label-based (forms)
await page.getByLabel('Email').fill('user@example.com');

// Last resort: CSS
await page.locator('[data-cy="submit-btn"]').click();`,
    language: "typescript",
    difficulty: "easy",
    experience: ["junior", "mid"],
    category: "Locators & Selectors",
    tags: ["locators", "getByRole", "selectors", "best practice"],
  },
  {
    id: "pw-4",
    question: "Explain Playwright's auto-waiting mechanism. When does it NOT wait automatically?",
    answer:
      "Playwright waits automatically for:\n" +
      "• Element to be **attached** to the DOM\n" +
      "• Element to be **visible** (not display:none or visibility:hidden)\n" +
      "• Element to be **stable** (not animating)\n" +
      "• Element to be **enabled** (not disabled attribute)\n" +
      "• Element to **receive events** (not covered by another element)\n\n" +
      "Auto-waiting does NOT apply to:\n" +
      "• `page.evaluate()` — runs immediately\n" +
      "• `locator.isVisible()` / `locator.isEnabled()` — snapshot checks, return instantly\n" +
      "• `page.waitForTimeout()` — explicit time-based wait\n" +
      "• Assertions like `expect(locator).toBeVisible()` use their own retry mechanism (default 5s timeout) separately from action auto-waiting.\n\n" +
      "Default action timeout is 30s, configurable in `playwright.config.ts` via `use.actionTimeout`.",
    difficulty: "medium",
    experience: ["junior", "mid"],
    category: "Playwright Basics",
    tags: ["auto-waiting", "timeout", "stability"],
  },
  {
    id: "pw-5",
    question: "What is a Browser Context in Playwright and why is it useful?",
    answer:
      "A BrowserContext is an isolated browser session — think of it as a private/incognito window. Each context has its own:\n" +
      "• Cookies and session storage\n" +
      "• Local storage\n" +
      "• Cached credentials\n\n" +
      "Why it matters:\n" +
      "• **Parallel isolation**: Each test gets a fresh context, so cookies from one test don't leak to another — without spawning a whole new browser process.\n" +
      "• **Multi-user testing**: Open two contexts in one test to simulate User A and User B interacting.\n" +
      "• **State injection**: Save an authenticated state to a JSON file (`storageState`) and reuse it across tests to skip login.",
    code:
      `// Save auth state once
await page.context().storageState({ path: 'auth.json' });

// Reuse in playwright.config.ts
use: {
  storageState: 'auth.json',
}`,
    language: "typescript",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "Playwright Basics",
    tags: ["browser context", "isolation", "auth state", "storage state"],
  },
  {
    id: "pw-6",
    question: "How do you handle network interception and request mocking in Playwright?",
    answer:
      "Use `page.route(urlPattern, handler)`. The handler receives a `Route` object and a `Request` object.\n\n" +
      "Common patterns:\n" +
      "• **Mock an API response**: call `route.fulfill({ body, status })`\n" +
      "• **Abort a request**: call `route.abort()`\n" +
      "• **Modify a request**: call `route.continue({ headers })`\n" +
      "• **Record & replay**: combine `page.on('response', …)` with `route.fetch()`",
    code:
      `test('mocked product list', async ({ page }) => {
  await page.route('**/api/products', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 1, name: 'Widget' }]),
    });
  });
  await page.goto('/products');
  await expect(page.getByText('Widget')).toBeVisible();
});`,
    language: "typescript",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "API Testing",
    tags: ["network", "route", "mock", "API"],
  },
  {
    id: "pw-7",
    question: "What is `page.evaluate()` and when should you use it (and avoid it)?",
    answer:
      "**`page.evaluate(fn, arg?)`** runs a function inside the browser page's JavaScript context and returns the serialised result.\n\n" +
      "**When to use:**\n" +
      "• Accessing DOM properties not exposed via locators (e.g. computed CSS, scroll position)\n" +
      "• Triggering custom events or calling browser-side APIs\n" +
      "• Injecting test data directly into the app's state\n\n" +
      "**When to avoid:**\n" +
      "• Don't use it instead of proper locators and actions — you bypass Playwright's auto-waiting\n" +
      "• Avoid complex business logic — if the app changes, the JS in evaluate() silently breaks",
    code:
      `// Good use: reading a DOM property
const scrollY = await page.evaluate(() => window.scrollY);

// Bad use: clicking when getByRole() exists
// BAD: await page.evaluate(() => document.querySelector('#btn').click());
// GOOD: await page.getByRole('button').click();`,
    language: "typescript",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "Playwright Basics",
    tags: ["evaluate", "browser context", "DOM"],
  },
  {
    id: "pw-8",
    question: "How do you handle file uploads in Playwright?",
    answer:
      "Use `locator.setInputFiles(filePath)` for `<input type='file'>`. For more complex drag-drop or button-triggered dialogs, use `page.waitForFileChooser()`.",
    code:
      `// Simple input
await page.getByLabel('Upload file').setInputFiles('tests/fixtures/cv.pdf');

// Multiple files
await page.getByLabel('Attachments').setInputFiles([
  'tests/fixtures/img1.png',
  'tests/fixtures/img2.png',
]);

// Drag-drop area without visible input
const [fileChooser] = await Promise.all([
  page.waitForEvent('filechooser'),
  page.getByText('Browse files').click(),
]);
await fileChooser.setFiles('tests/fixtures/data.csv');`,
    language: "typescript",
    difficulty: "medium",
    experience: ["mid"],
    category: "Playwright Basics",
    tags: ["file upload", "input", "file chooser"],
  },
  {
    id: "pw-9",
    question: "Explain the difference between `locator.waitFor()` and `expect(locator).toBeVisible()`.",
    answer:
      "Both wait for an element, but they serve different purposes:\n\n" +
      "**`locator.waitFor({ state })`**\n" +
      "• Waits for an element to reach a given state: `attached`, `detached`, `visible`, `hidden`\n" +
      "• Used for synchronisation (\"wait for spinner to disappear\")\n" +
      "• Does NOT produce a test assertion failure by itself\n\n" +
      "**`expect(locator).toBeVisible()`**\n" +
      "• An assertion — fails the test if the element is not visible within the assertion timeout\n" +
      "• Used to verify the expected UI state after an action\n\n" +
      "Rule of thumb: use `waitFor()` for timing control; use `expect()` for assertions.",
    code:
      `// Wait for loading spinner to disappear
await page.getByTestId('loading-spinner').waitFor({ state: 'detached' });

// Assert result is visible
await expect(page.getByText('Data loaded')).toBeVisible();`,
    language: "typescript",
    difficulty: "medium",
    experience: ["junior", "mid"],
    category: "Playwright Basics",
    tags: ["waitFor", "expect", "assertions", "timing"],
  },
  {
    id: "pw-10",
    question: "How do you run Playwright tests in parallel and what configuration is needed?",
    answer:
      "Playwright runs files in parallel by default (one worker per CPU core). You control parallelism at three levels:\n\n" +
      "1. **File level** (`fullyParallel: false`, default) — tests within a file run sequentially, files run in parallel\n" +
      "2. **Test level** (`fullyParallel: true`) — every test, even in the same file, runs in parallel\n" +
      "3. **`test.describe.parallel()`** — mark a specific describe block as parallel\n\n" +
      "Key considerations:\n" +
      "• Each worker gets a fresh browser context → tests are isolated\n" +
      "• Use `--workers N` CLI flag or `workers` config option\n" +
      "• Shared state (DB, file system) needs careful handling to avoid race conditions",
    code:
      `// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined, // fewer workers on CI
  use: { baseURL: 'http://localhost:3000' },
});`,
    language: "typescript",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "CI/CD & Reporting",
    tags: ["parallel", "workers", "config", "performance"],
  },

  /* ══════════════════════════════════════════════════════
     LOCATORS & SELECTORS
  ══════════════════════════════════════════════════════ */
  {
    id: "loc-1",
    question: "What is the `filter()` method on a locator and when would you use it?",
    answer:
      "`locator.filter()` narrows a locator to a subset matching additional conditions — text, another locator, or `hasNot`.\n\n" +
      "Common use cases:\n" +
      "• Finding a table row that contains specific text\n" +
      "• Picking a card from a list by its title\n" +
      "• Excluding elements that contain certain content",
    code:
      `// Find the table row containing 'John' and click its Edit button
await page.getByRole('row')
  .filter({ hasText: 'John' })
  .getByRole('button', { name: 'Edit' })
  .click();

// Find product card with title 'Widget'
const card = page.getByTestId('product-card')
  .filter({ has: page.getByText('Widget') });
await card.getByText('Add to cart').click();`,
    language: "typescript",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "Locators & Selectors",
    tags: ["filter", "locator", "chaining"],
  },
  {
    id: "loc-2",
    question: "How do you handle dynamic or generated IDs/classes that change on every page load?",
    answer:
      "Avoid selectors based on dynamic IDs or random class names. Preferred approaches:\n\n" +
      "1. **`data-testid` attributes** – ask developers to add stable test hooks: `data-testid='submit-btn'` → `getByTestId('submit-btn')`\n" +
      "2. **ARIA roles + visible text** – `getByRole('button', { name: 'Submit' })` — works regardless of class changes\n" +
      "3. **Labels for inputs** – `getByLabel('Email')` is immune to ID changes\n" +
      "4. **Ancestor chain** – scope a locator to a stable parent: `page.getByTestId('checkout-form').getByRole('button')`\n" +
      "5. **Attribute filter** – `locator('[data-status=\"active\"]')` where the data attribute is application-meaningful, not auto-generated",
    difficulty: "medium",
    experience: ["junior", "mid"],
    category: "Locators & Selectors",
    tags: ["dynamic IDs", "test-id", "fragile selectors", "best practice"],
  },
  {
    id: "loc-3",
    question: "Explain `page.locator()` vs `page.$()`  — what is the difference?",
    answer:
      "`page.$()` is a legacy Puppeteer-style method that returns a single ElementHandle (an opaque reference to a DOM node). ElementHandles are discouraged in modern Playwright because:\n" +
      "• They don't auto-wait on interactions\n" +
      "• They can become stale if the DOM changes\n" +
      "• They don't support auto-retry assertions\n\n" +
      "`page.locator()` returns a **Locator** — a lightweight, lazy description of how to find an element. It re-queries the DOM on each action, auto-waits, and works seamlessly with `expect()` assertions.\n\n" +
      "**Always prefer Locators over ElementHandles** in modern Playwright.",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "Locators & Selectors",
    tags: ["locator", "ElementHandle", "stale reference"],
  },

  /* ══════════════════════════════════════════════════════
     PAGE OBJECT MODEL
  ══════════════════════════════════════════════════════ */
  {
    id: "pom-1",
    question: "What is the Page Object Model pattern and why do you use it?",
    answer:
      "The **Page Object Model (POM)** is a design pattern where each page (or reusable component) of the application is represented by a class that encapsulates:\n" +
      "• **Locators** – how to find UI elements\n" +
      "• **Actions** – methods that perform user interactions (login, search, submit)\n\n" +
      "Benefits:\n" +
      "• **Maintainability** – when UI changes, update the POM class, not every test\n" +
      "• **Readability** – tests read as user stories: `loginPage.login('alice', 'pass')`\n" +
      "• **Reusability** – shared actions across tests without duplication\n" +
      "• **Single Responsibility** – tests focus on what to verify, POMs on how to interact",
    code:
      `// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitBtn: Locator;
  constructor(private readonly page: Page) {
    this.emailInput   = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitBtn    = page.getByRole('button', { name: 'Sign In' });
  }
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }
}

// tests/login.spec.ts
test('valid login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@test.com', 'pass123');
  await expect(page).toHaveURL('/dashboard');
});`,
    language: "typescript",
    difficulty: "medium",
    experience: ["junior", "mid", "senior"],
    category: "Page Object Model",
    tags: ["POM", "design pattern", "maintainability"],
  },
  {
    id: "pom-2",
    question: "How does lazy initialization improve Page Object Models and when should you use it?",
    answer:
      "In standard POM, locators are instantiated in the constructor, which means the constructor queries the DOM immediately — even before `page.goto()` is called. If the page isn't loaded yet, the test still works (Playwright locators are lazy by default) but the pattern can be misleading.\n\n" +
      "**Lazy (getter-based) POM** creates a fresh locator on each property access. Benefits:\n" +
      "• Each call re-queries the DOM — avoids stale references after navigation\n" +
      "• Constructor stays clean (just stores `page`)\n" +
      "• More explicit: it's clear each access is a live query\n\n" +
      "Prefer lazy init in large apps with a lot of client-side navigation.",
    code:
      `// Lazy (getter-based) POM
export class LoginPage {
  constructor(private readonly page: Page) {}

  get emailInput(): Locator {
    return this.page.getByLabel('Email');
  }
  get submitBtn(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.submitBtn.click();
  }
}`,
    language: "typescript",
    difficulty: "hard",
    experience: ["senior", "lead"],
    category: "Page Object Model",
    tags: ["lazy initialization", "getters", "POM", "patterns"],
  },
  {
    id: "pom-3",
    question: "How would you structure a POM for an application with shared components (header, footer, nav)?",
    answer:
      "Model shared components as their own component classes and compose them into page objects.\n\n" +
      "Approaches:\n" +
      "1. **Composition** – each page has a `.header` property that returns a `HeaderComponent` instance\n" +
      "2. **Base Page class** – a `BasePage` with `header`, `footer`, `nav` properties; all page POMs extend it\n" +
      "3. **Component Registry** – a factory/service that returns component instances lazily\n\n" +
      "Avoid deep inheritance trees (max 2 levels: BasePage → specific page). Prefer composition over inheritance for flexibility.",
    code:
      `class BasePage {
  readonly header: HeaderComponent;
  readonly nav: NavComponent;
  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.nav    = new NavComponent(page);
  }
}

class DashboardPage extends BasePage {
  async getWelcomeMessage() {
    return this.page.getByTestId('welcome-msg').textContent();
  }
}`,
    language: "typescript",
    difficulty: "hard",
    experience: ["senior", "lead"],
    category: "Page Object Model",
    tags: ["POM", "components", "inheritance", "composition"],
  },

  /* ══════════════════════════════════════════════════════
     FIXTURES & CONFIG
  ══════════════════════════════════════════════════════ */
  {
    id: "fix-1",
    question: "What are Playwright Fixtures and how are they different from `beforeEach`?",
    answer:
      "**Fixtures** are typed, dependency-injected test context values. They can:\n" +
      "• Be scoped to `test` (fresh per test) or `worker` (shared within a worker process)\n" +
      "• Automatically set up and tear down via `use(value)` + code after `await use()`\n" +
      "• Be composed — fixtures can depend on other fixtures\n" +
      "• Only run when a test actually requests them (lazy evaluation)\n\n" +
      "`beforeEach` is a simple hook that always runs regardless of whether the setup is needed. Fixtures are more modular and testable.\n\n" +
      "Think of fixtures as typed, reusable `beforeEach/afterEach` that can be shared across test files.",
    code:
      `// fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

type MyFixtures = { loginPage: LoginPage; loggedIn: void };

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  loggedIn: async ({ loginPage }, use) => {
    await loginPage.login('user@test.com', 'secret');
    await use(); // test runs here
    // teardown: nothing to clean up
  },
});

// test file
test('dashboard visible after login', async ({ loggedIn, page }) => {
  await expect(page.getByText('Welcome')).toBeVisible();
});`,
    language: "typescript",
    difficulty: "hard",
    experience: ["mid", "senior"],
    category: "Fixtures & Config",
    tags: ["fixtures", "beforeEach", "dependency injection"],
  },
  {
    id: "fix-2",
    question: "How do you reuse authentication state across tests without logging in every time?",
    answer:
      "Use `storageState` to save cookies + localStorage after one login, then inject it into subsequent browser contexts.\n\n" +
      "Best practice: create a `global-setup.ts` that logs in once and saves state. Configure `storageState` per project or per fixture.",
    code:
      `// global-setup.ts
import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Email').fill('admin@test.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.context().storageState({ path: '.auth/admin.json' });
  await browser.close();
}
export default globalSetup;

// playwright.config.ts
export default defineConfig({
  globalSetup: './global-setup',
  projects: [
    { name: 'Admin tests', use: { storageState: '.auth/admin.json' } },
    { name: 'Guest tests', use: { storageState: undefined } },
  ],
});`,
    language: "typescript",
    difficulty: "hard",
    experience: ["mid", "senior"],
    category: "Fixtures & Config",
    tags: ["storageState", "auth", "global setup", "performance"],
  },

  /* ══════════════════════════════════════════════════════
     API TESTING
  ══════════════════════════════════════════════════════ */
  {
    id: "api-1",
    question: "How do you make API requests directly in Playwright without a browser page?",
    answer:
      "Use `request` fixture or `playwright.request.newContext()`. The `APIRequestContext` supports GET, POST, PUT, DELETE, PATCH and returns `APIResponse` objects with status, headers, and body.",
    code:
      `test('create user via API', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Alice', email: 'alice@test.com' },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.name).toBe('Alice');
});

// Assert full schema
test('user list returns array', async ({ request }) => {
  const res = await request.get('/api/users');
  expect(res.ok()).toBeTruthy();
  const users = await res.json();
  expect(Array.isArray(users)).toBe(true);
});`,
    language: "typescript",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "API Testing",
    tags: ["API testing", "request", "REST", "fetch"],
  },
  {
    id: "api-2",
    question: "What is the difference between `page.route()` and using the `request` fixture for API testing?",
    answer:
      "`page.route()` — intercepts HTTP requests made **by the browser** (UI layer). Use it to:\n" +
      "• Mock responses so the UI shows specific data\n" +
      "• Block third-party scripts (analytics, ads)\n" +
      "• Spy on what the frontend is sending\n\n" +
      "`request` fixture — makes API calls **directly from Node.js**, bypassing the browser. Use it to:\n" +
      "• Test the backend API independently\n" +
      "• Seed test data before a UI test\n" +
      "• Verify backend state after a UI action\n\n" +
      "Combining both is a powerful pattern: set up data via `request`, then validate the UI renders it correctly.",
    difficulty: "hard",
    experience: ["senior", "lead"],
    category: "API Testing",
    tags: ["route", "request", "API", "network"],
  },

  /* ══════════════════════════════════════════════════════
     VISUAL TESTING
  ══════════════════════════════════════════════════════ */
  {
    id: "vis-1",
    question: "How does Playwright visual (screenshot) testing work? What are the pitfalls?",
    answer:
      "Playwright's `expect(page).toMatchSnapshot()` or `expect(locator).toMatchSnapshot()` captures a PNG and compares it pixel-by-pixel against a stored baseline.\n\n" +
      "**Workflow:**\n" +
      "1. First run: no baseline → captures and saves it (test passes)\n" +
      "2. Subsequent runs: compares against saved baseline; fails if pixels differ beyond threshold\n" +
      "3. Update baseline: `npx playwright test --update-snapshots`\n\n" +
      "**Pitfalls:**\n" +
      "• Dynamic content (dates, user avatars, ads) causes false failures — mask them with `mask: [locator]`\n" +
      "• Different OS/GPU rendering produces different screenshots — use a consistent Docker environment in CI\n" +
      "• Font anti-aliasing differs across platforms — set `maxDiffPixelRatio: 0.01` to allow small tolerance\n" +
      "• Animations cause flakiness — disable them in tests via CSS: `page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; }' })`",
    code:
      `test('homepage snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toMatchSnapshot('homepage.png', {
    maxDiffPixelRatio: 0.01,
    mask: [page.getByTestId('live-clock')],
  });
});`,
    language: "typescript",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "Visual Testing",
    tags: ["snapshot", "screenshot", "visual regression", "toMatchSnapshot"],
  },

  /* ══════════════════════════════════════════════════════
     CI/CD & REPORTING
  ══════════════════════════════════════════════════════ */
  {
    id: "ci-1",
    question: "How do you integrate Playwright into a GitHub Actions pipeline?",
    answer:
      "Use the official `microsoft/playwright-github-action` or configure directly in a workflow YAML.\n\n" +
      "Key steps:\n" +
      "1. Install Node + dependencies\n" +
      "2. Install Playwright browsers (`npx playwright install --with-deps`)\n" +
      "3. Run tests (`npx playwright test`)\n" +
      "4. Upload the HTML report as an artifact",
    code:
      `# .github/workflows/e2e.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30`,
    language: "any",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "CI/CD & Reporting",
    tags: ["CI/CD", "GitHub Actions", "pipeline", "artifact"],
  },
  {
    id: "ci-2",
    question: "Playwright test is flaky in CI but passes locally. What are the most common causes and fixes?",
    answer:
      "Common root causes:\n\n" +
      "1. **Slower CI environment** – increase timeout in `playwright.config.ts`: `timeout: 60_000`\n" +
      "2. **Different viewport / DPR** – set consistent: `use: { viewport: { width: 1280, height: 720 } }`\n" +
      "3. **Network latency** – CI may call real external services slower; mock them with `page.route()`\n" +
      "4. **Missing `await`** – a forgotten await causes a race condition locally hidden by slow rendering\n" +
      "5. **Animations** – CI renders faster, catching mid-animation; disable via CSS or `page.waitForLoadState('networkidle')`\n" +
      "6. **Test order dependency** – tests share DB state; use `beforeEach` to reset state\n" +
      "7. **Date/time sensitivity** – freeze time with `page.clock.install()` (Playwright v1.45+)\n" +
      "8. **Resource contention** – too many workers; reduce with `workers: 2` on CI\n\n" +
      "Debug: use `--retries 2` to confirm flakiness, enable `--trace on` to record a trace on failure.",
    difficulty: "hard",
    experience: ["mid", "senior", "lead"],
    category: "Debugging",
    tags: ["flaky tests", "CI/CD", "debugging", "stability"],
  },

  /* ══════════════════════════════════════════════════════
     DEBUGGING
  ══════════════════════════════════════════════════════ */
  {
    id: "dbg-1",
    question: "What debugging tools does Playwright provide and how do you use them?",
    answer:
      "Playwright has four main debugging tools:\n\n" +
      "1. **Playwright Inspector** (`--debug` flag) – opens a UI overlay that lets you step through tests, highlights actions, and shows the locator picker\n" +
      "2. **Trace Viewer** (`npx playwright show-trace trace.zip`) – post-mortem HTML report with timeline, screenshots, DOM snapshots, network calls, and console logs\n" +
      "3. **Headed mode** (`--headed`) – opens a visible browser so you can watch the test run\n" +
      "4. **`page.pause()`** – pauses test execution at a specific point and opens the Inspector\n\n" +
      "For CI failures: always configure `trace: 'retain-on-failure'` so you can download and inspect the trace.",
    code:
      `// playwright.config.ts — capture traces on failure
use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}`,
    language: "typescript",
    difficulty: "easy",
    experience: ["junior", "mid"],
    category: "Debugging",
    tags: ["trace viewer", "inspector", "debugging", "headed"],
  },

  /* ══════════════════════════════════════════════════════
     PYTHON PLAYWRIGHT
  ══════════════════════════════════════════════════════ */
  {
    id: "py-1",
    question: "What is the difference between Playwright's sync and async Python APIs?",
    answer:
      "Playwright Python has two APIs:\n\n" +
      "**Sync API** (`playwright.sync_api`)\n" +
      "• Uses Python's `with sync_playwright() as p:` context manager\n" +
      "• Runs synchronously — straightforward for scripts and simple tests\n" +
      "• Used with pytest via `@pytest.fixture` (sync fixtures)\n\n" +
      "**Async API** (`playwright.async_api`)\n" +
      "• Uses Python `asyncio` — `async with async_playwright() as p:`\n" +
      "• Required if integrating with async frameworks (FastAPI test client, etc.)\n" +
      "• Methods are coroutines — must be `await`ed\n\n" +
      "**For pytest**: the `pytest-playwright` plugin uses the sync API by default. Most teams use sync.",
    code:
      `# Sync (recommended for pytest)
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://example.com")
    assert "Example" in page.title()
    browser.close()`,
    language: "python",
    difficulty: "easy",
    experience: ["junior", "mid"],
    category: "Python (Playwright)",
    tags: ["python", "sync", "async", "pytest"],
  },
  {
    id: "py-2",
    question: "How do you write a Page Object Model in Python Playwright?",
    answer:
      "Python POMs follow the same pattern as TypeScript but use snake_case naming and Python type hints. With `pytest-playwright`, the `page` fixture is injected automatically.",
    code:
      `# pages/login_page.py
from playwright.sync_api import Page, Locator

class LoginPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.email_field: Locator = page.get_by_label("Email")
        self.password_field: Locator = page.get_by_label("Password")
        self.submit_btn: Locator = page.get_by_role("button", name="Sign In")

    def login(self, email: str, password: str) -> None:
        self.email_field.fill(email)
        self.password_field.fill(password)
        self.submit_btn.click()

    def navigate(self) -> None:
        self.page.goto("/login")

# tests/test_login.py
import pytest
from pages.login_page import LoginPage

def test_valid_login(page):
    login = LoginPage(page)
    login.navigate()
    login.login("user@test.com", "secret")
    assert page.url.endswith("/dashboard")`,
    language: "python",
    difficulty: "medium",
    experience: ["junior", "mid"],
    category: "Python (Playwright)",
    tags: ["python", "POM", "pytest", "page object"],
  },
  {
    id: "py-3",
    question: "How do you use fixtures and conftest.py in pytest-playwright?",
    answer:
      "pytest-playwright provides built-in fixtures (`browser`, `context`, `page`) and you extend them in `conftest.py`.\n\n" +
      "Custom fixtures in `conftest.py` follow pytest's standard fixture pattern. The `page` fixture gives a fresh browser context per test.",
    code:
      `# conftest.py
import pytest
from pages.login_page import LoginPage

@pytest.fixture
def logged_in_page(page):
    """Fixture that logs in and returns the page."""
    login = LoginPage(page)
    login.navigate()
    login.login("admin@test.com", "secret")
    yield page  # test runs here
    # teardown if needed

@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Override viewport for all tests."""
    return {**browser_context_args, "viewport": {"width": 1280, "height": 720}}`,
    language: "python",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "Python (Playwright)",
    tags: ["python", "pytest", "conftest", "fixtures"],
  },
  {
    id: "py-4",
    question: "How do you handle API testing in Python Playwright?",
    answer:
      "Use `playwright.request.new_context()` for standalone API requests or the `api_request_context` fixture from pytest-playwright.",
    code:
      `# Using request context in a test
def test_create_user(playwright):
    request_context = playwright.request.new_context(
        base_url="http://localhost:3000"
    )
    response = request_context.post("/api/users", data={
        "name": "Alice",
        "email": "alice@test.com"
    })
    assert response.status == 201
    body = response.json()
    assert body["name"] == "Alice"
    request_context.dispose()

# Mixing API setup with UI test
def test_user_appears_in_list(page, playwright):
    # Seed data via API
    ctx = playwright.request.new_context(base_url="http://localhost:3000")
    ctx.post("/api/users", data={"name": "Bob", "email": "bob@test.com"})
    # Verify in UI
    page.goto("/users")
    page.get_by_role("row").filter(has_text="Bob").wait_for()`,
    language: "python",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "Python (Playwright)",
    tags: ["python", "API testing", "request context"],
  },
  {
    id: "py-5",
    question: "How do you run Playwright Python tests in parallel with pytest-xdist?",
    answer:
      "Install `pytest-xdist` and pass `-n auto` (or `-n 4` for 4 workers). Each worker gets its own browser instance.\n\n" +
      "Important: pytest fixtures must be thread-safe. Avoid shared mutable state. Use function-scoped `page` and `context` fixtures (default).\n\n" +
      "For session-scoped fixtures (e.g. a seeded DB), use `scope='session'` carefully and add locking if needed.",
    code:
      `# Install
# pip install pytest-xdist pytest-playwright

# Run in parallel
# pytest tests/ -n auto --headed

# pytest.ini or pyproject.toml
[pytest]
addopts = -n auto`,
    language: "python",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "Python (Playwright)",
    tags: ["python", "parallel", "pytest-xdist", "performance"],
  },

  /* ══════════════════════════════════════════════════════
     JAVA PLAYWRIGHT
  ══════════════════════════════════════════════════════ */
  {
    id: "java-1",
    question: "How do you set up Playwright in a Java project with Maven?",
    answer:
      "Add the Playwright dependency to `pom.xml`, then install browsers with `mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args=\"install\"`.",
    code:
      `<!-- pom.xml -->
<dependency>
  <groupId>com.microsoft.playwright</groupId>
  <artifactId>playwright</artifactId>
  <version>1.49.0</version>
</dependency>

// Basic test with JUnit 5
import com.microsoft.playwright.*;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class LoginTest {
  static Playwright playwright;
  static Browser browser;
  BrowserContext context;
  Page page;

  @BeforeAll
  static void launchBrowser() {
    playwright = Playwright.create();
    browser = playwright.chromium().launch();
  }
  @BeforeEach
  void createContext() {
    context = browser.newContext();
    page = context.newPage();
  }
  @AfterEach
  void closeContext() { context.close(); }
  @AfterAll
  static void closeBrowser() {
    browser.close();
    playwright.close();
  }
  @Test
  void pageHasTitle() {
    page.navigate("https://playwright.dev/java");
    assertTrue(page.title().contains("Playwright"));
  }
}`,
    language: "java",
    difficulty: "medium",
    experience: ["junior", "mid"],
    category: "Java (Playwright)",
    tags: ["java", "maven", "JUnit5", "setup"],
  },
  {
    id: "java-2",
    question: "How do you write a Page Object Model in Java Playwright?",
    answer:
      "Java POMs use `private final Locator` fields initialized in the constructor (or getter methods for lazy init). Follows the same POM principles as TypeScript.",
    code:
      `import com.microsoft.playwright.*;
import com.microsoft.playwright.options.AriaRole;

public class LoginPage {
    private final Page page;
    private final Locator emailField;
    private final Locator passwordField;
    private final Locator signInButton;

    public LoginPage(Page page) {
        this.page = page;
        this.emailField   = page.getByLabel("Email");
        this.passwordField = page.getByLabel("Password");
        this.signInButton = page.getByRole(AriaRole.BUTTON,
            new Page.GetByRoleOptions().setName("Sign In"));
    }

    public void navigate() { page.navigate("/login"); }

    public void login(String email, String password) {
        emailField.fill(email);
        passwordField.fill(password);
        signInButton.click();
    }
    public boolean isDashboardVisible() {
        return page.url().endsWith("/dashboard");
    }
}`,
    language: "java",
    difficulty: "medium",
    experience: ["junior", "mid"],
    category: "Java (Playwright)",
    tags: ["java", "POM", "JUnit5", "page object"],
  },
  {
    id: "java-3",
    question: "How do you handle getByRole with AriaRole in Java Playwright?",
    answer:
      "Java Playwright uses the `AriaRole` enum (unlike TS where you pass a string). Options are set via a nested options class with setter chaining.",
    code:
      `import com.microsoft.playwright.options.AriaRole;

// Button
Locator submitBtn = page.getByRole(AriaRole.BUTTON,
    new Page.GetByRoleOptions().setName("Submit"));

// Textbox
Locator emailInput = page.getByRole(AriaRole.TEXTBOX,
    new Page.GetByRoleOptions().setName("Email"));

// Link
Locator forgotLink = page.getByRole(AriaRole.LINK,
    new Page.GetByRoleOptions().setName("Forgot password?"));

// Row in a table
Locator userRow = page.getByRole(AriaRole.ROW)
    .filter(new Locator.FilterOptions().setHasText("Alice"));`,
    language: "java",
    difficulty: "medium",
    experience: ["junior", "mid"],
    category: "Java (Playwright)",
    tags: ["java", "AriaRole", "getByRole", "locators"],
  },
  {
    id: "java-4",
    question: "How do you use lazy initialization (getter pattern) in Java Playwright POMs?",
    answer:
      "Instead of `private final Locator` fields, use `public Locator methodName()` methods that return a fresh locator on each call. This avoids constructor-time DOM queries and handles SPAs better.",
    code:
      `public class CheckoutPage {
    private final Page page;

    public CheckoutPage(Page page) {
        this.page = page;
    }

    // Lazy getters — re-query DOM on each call
    public Locator cardNumberInput() {
        return page.getByLabel("Card number");
    }
    public Locator expiryInput() {
        return page.getByLabel("Expiry date");
    }
    public Locator payNowButton() {
        return page.getByRole(AriaRole.BUTTON,
            new Page.GetByRoleOptions().setName("Pay now"));
    }

    public void fillCard(String number, String expiry, String cvv) {
        cardNumberInput().fill(number);
        expiryInput().fill(expiry);
        page.getByLabel("CVV").fill(cvv);
    }
}`,
    language: "java",
    difficulty: "hard",
    experience: ["senior", "lead"],
    category: "Java (Playwright)",
    tags: ["java", "lazy init", "getters", "POM"],
  },
  {
    id: "java-5",
    question: "How do you run Playwright Java tests in parallel with JUnit 5?",
    answer:
      "JUnit 5 supports parallel execution via `junit-platform.properties`. Each thread needs its own Playwright/Browser/Context/Page because they are not thread-safe.",
    code:
      `# src/test/resources/junit-platform.properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=4

// Use ThreadLocal to give each thread its own instances
class TestBase {
    private static final ThreadLocal<Playwright> playwrightTL = new ThreadLocal<>();
    private static final ThreadLocal<Browser> browserTL     = new ThreadLocal<>();

    @BeforeEach
    void setup() {
        playwrightTL.set(Playwright.create());
        browserTL.set(playwrightTL.get().chromium().launch());
    }
    @AfterEach
    void teardown() {
        browserTL.get().close();
        playwrightTL.get().close();
    }
    protected Page newPage() {
        return browserTL.get().newContext().newPage();
    }
}`,
    language: "java",
    difficulty: "hard",
    experience: ["senior", "lead"],
    category: "Java (Playwright)",
    tags: ["java", "parallel", "JUnit5", "ThreadLocal"],
  },

  /* ══════════════════════════════════════════════════════
     FRAMEWORK DESIGN
  ══════════════════════════════════════════════════════ */
  {
    id: "des-1",
    question: "You're starting a new automation project from scratch. Walk me through the framework architecture you'd design.",
    answer:
      "A production-grade Playwright framework should have:\n\n" +
      "**Directory structure:**\n" +
      "```\n" +
      "tests/\n  fixtures/     # Custom fixtures & test extensions\n  pages/        # Page Object Models\n  components/   # Shared component classes\n  utils/        # Helpers (data generators, API clients)\n  data/         # Test data files\nplaywright.config.ts\n" +
      "```\n\n" +
      "**Key design decisions:**\n" +
      "1. **Custom test object** – extend `base.extend<>()` with all page objects and utilities injected as fixtures\n" +
      "2. **Global setup/teardown** – DB seeding, auth token caching\n" +
      "3. **Projects configuration** – separate projects for smoke, regression, and API tests; per-environment `baseURL`\n" +
      "4. **Reporting** – HTML report + Allure/Playwright HTML; upload to CI artifact\n" +
      "5. **Retry policy** – `retries: 1` on CI only; `retries: 0` locally to catch flakiness\n" +
      "6. **Linting/TypeScript** – strict mode, ESLint with `@typescript-eslint`\n" +
      "7. **Data management** – factory functions for test data, never hardcode in tests",
    difficulty: "design",
    experience: ["senior", "lead"],
    category: "Framework Design",
    tags: ["architecture", "framework", "design", "project structure"],
  },
  {
    id: "des-2",
    question: "How do you handle test data management in a large automation framework?",
    answer:
      "Test data strategy at scale:\n\n" +
      "**1. Factory pattern** – create typed factory functions that return valid test entities\n" +
      "```ts\nfunction makeUser(overrides = {}): UserData {\n  return { name: 'Test User', email: `user-${Date.now()}@test.com`, ...overrides };\n}\n```\n\n" +
      "**2. API seeding** – use REST calls in fixtures to create/clean data rather than hitting the DB directly\n\n" +
      "**3. Unique identifiers** – append timestamps or UUIDs to avoid test collisions in parallel runs\n\n" +
      "**4. Data cleanup** – `afterEach` or `afterAll` to delete created data via API\n\n" +
      "**5. Test accounts** – maintain fixed test accounts in each environment with `storageState` for auth\n\n" +
      "**6. Avoid test ordering** – each test creates its own data; never rely on previous test's data",
    difficulty: "design",
    experience: ["senior", "lead"],
    category: "Framework Design",
    tags: ["test data", "factory", "seeding", "parallel", "design"],
  },
  {
    id: "des-3",
    question: "How do you design a multi-environment (dev/staging/prod) test framework?",
    answer:
      "Use Playwright's **projects** configuration combined with environment variables:\n\n" +
      "1. **`baseURL` per environment** – controlled via `BASE_URL` env variable or per-project config\n" +
      "2. **Per-environment credentials** – load from `.env.staging`, `.env.prod` with `dotenv`\n" +
      "3. **Playwright projects** – define separate projects in `playwright.config.ts` that set `baseURL` and `storageState`\n" +
      "4. **CI matrix** – GitHub Actions matrix job per environment\n" +
      "5. **Feature flags** – skip tests behind unreleased features with `test.skip(process.env.ENV !== 'staging')`",
    code:
      `// playwright.config.ts
const ENV = process.env.TEST_ENV ?? 'staging';
const BASE_URLS = {
  dev:     'http://localhost:3000',
  staging: 'https://staging.myapp.com',
  prod:    'https://myapp.com',
};
export default defineConfig({
  use: { baseURL: BASE_URLS[ENV] },
});`,
    language: "typescript",
    difficulty: "design",
    experience: ["senior", "lead"],
    category: "Framework Design",
    tags: ["environments", "config", "projects", "CI/CD"],
  },
  {
    id: "des-4",
    question: "How would you reduce test execution time for a suite of 500+ E2E tests?",
    answer:
      "**Parallelism:**\n" +
      "• Enable `fullyParallel: true` and scale `workers` to available CPU/cloud runners\n" +
      "• Split tests across multiple CI runners using `--shard N/M`\n\n" +
      "**Smart test selection:**\n" +
      "• Run only affected tests on PRs (needs impact analysis or tagging)\n" +
      "• Tag tests by criticality — run `@smoke` on every commit, full suite nightly\n\n" +
      "**Faster setup:**\n" +
      "• Reuse authentication state (`storageState`) — avoid login per test\n" +
      "• Seed test data via API (100× faster than UI flows)\n" +
      "• Use `worker` scope for expensive fixtures (DB connections)\n\n" +
      "**Remove waste:**\n" +
      "• Delete duplicate/obsolete tests regularly\n" +
      "• Move pure UI logic tests to component/unit level (test pyramid)\n" +
      "• Flaky tests should be quarantined and fixed — not retried endlessly",
    difficulty: "design",
    experience: ["senior", "lead"],
    category: "Framework Design",
    tags: ["performance", "sharding", "parallel", "optimization"],
  },
  {
    id: "des-5",
    question: "What is test sharding in Playwright and how does it work with CI?",
    answer:
      "Sharding splits test files across multiple machines. Pass `--shard INDEX/TOTAL` to split the test suite.\n\n" +
      "Example: 4 shards on 4 GitHub Actions runners → each runs 25% of tests in parallel.\n\n" +
      "After all shards complete, merge their blob reports into a single HTML report using `npx playwright merge-reports`.",
    code:
      `# Run shard 1 of 4
npx playwright test --shard=1/4

# GitHub Actions matrix
strategy:
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]
steps:
  - run: npx playwright test --shard=$SHARD_INDEX/$SHARD_TOTAL
  # ($SHARD_INDEX = matrix.shardIndex, $SHARD_TOTAL = matrix.shardTotal)
  - uses: actions/upload-artifact@v4
    with:
      name: blob-report-$SHARD_INDEX
      path: blob-report/`,
    language: "any",
    difficulty: "hard",
    experience: ["senior", "lead"],
    category: "CI/CD & Reporting",
    tags: ["sharding", "CI/CD", "performance", "GitHub Actions"],
  },

  /* ══════════════════════════════════════════════════════
     QA FUNDAMENTALS
  ══════════════════════════════════════════════════════ */
  {
    id: "qa-1",
    question: "Explain the Testing Pyramid and where Playwright fits in it.",
    answer:
      "The Testing Pyramid (Mike Cohn) has three layers:\n\n" +
      "**Base — Unit Tests (70%)**: Test individual functions/classes in isolation. Fast (ms), cheap, no browser.\n\n" +
      "**Middle — Integration/Component Tests (20%)**: Test how modules interact. React Testing Library, API contract tests.\n\n" +
      "**Top — E2E Tests (10%)**: Test complete user flows through the UI. Slow, expensive, but highest confidence.\n\n" +
      "**Playwright lives at the top** (E2E) and sometimes the middle (API tests via `request` fixture, component testing via `@playwright/experimental-ct-react`).\n\n" +
      "Anti-pattern: The Ice Cream Cone — too many E2E tests, almost no unit tests. Causes slow, flaky pipelines.",
    difficulty: "easy",
    experience: ["junior", "mid"],
    category: "QA Fundamentals",
    tags: ["testing pyramid", "E2E", "unit tests", "strategy"],
  },
  {
    id: "qa-2",
    question: "What is the difference between smoke testing, regression testing, and sanity testing?",
    answer:
      "**Smoke Testing** (\"Build verification test\")\n" +
      "• Quick check that the critical paths work after a new build\n" +
      "• Runs in minutes — if it fails, don't proceed to full regression\n" +
      "• E.g. Can users log in? Can they navigate to key pages?\n\n" +
      "**Regression Testing**\n" +
      "• Broad suite verifying previously-working features still work after changes\n" +
      "• Runs on every PR or nightly\n" +
      "• Can take hours for large suites\n\n" +
      "**Sanity Testing**\n" +
      "• Narrow, focused check on a specific bug fix or new feature\n" +
      "• Not as wide as regression; confirms the specific fix works\n" +
      "• Often manual or a targeted automated subset",
    difficulty: "easy",
    experience: ["junior"],
    category: "QA Fundamentals",
    tags: ["smoke", "regression", "sanity", "test types"],
  },
  {
    id: "qa-3",
    question: "What is BDD and how does it integrate with Playwright?",
    answer:
      "**BDD (Behaviour-Driven Development)** uses natural-language feature files (Gherkin: Given/When/Then) to describe user stories that become executable tests.\n\n" +
      "To use BDD with Playwright:\n" +
      "1. **Cucumber.js** – use `@cucumber/cucumber` + `@playwright/test`; write step definitions that call Playwright actions\n" +
      "2. **playwright-bdd** – a dedicated package that generates Playwright test files from Gherkin feature files\n\n" +
      "Benefits: non-technical stakeholders can read/write scenarios.\n\n" +
      "Trade-offs: extra abstraction layer, harder to debug, slower to maintain.",
    difficulty: "medium",
    experience: ["junior", "mid"],
    category: "QA Fundamentals",
    tags: ["BDD", "Cucumber", "Gherkin", "Given When Then"],
  },
  {
    id: "qa-4",
    question: "How do you decide which tests to automate vs. leave as manual?",
    answer:
      "**Good candidates for automation:**\n" +
      "• High-frequency regression (every build)\n" +
      "• Data-driven tests with many input combinations\n" +
      "• Cross-browser / cross-device compatibility\n" +
      "• Performance/load tests\n" +
      "• Smoke tests for CI gates\n\n" +
      "**Keep as manual:**\n" +
      "• Exploratory testing — finding unknown unknowns\n" +
      "• Usability and UX testing\n" +
      "• Infrequently-run edge cases that are expensive to automate\n" +
      "• Tests for unstable features still in active development\n" +
      "• Security penetration testing\n\n" +
      "ROI formula: if the cost to automate + maintain < time saved over N runs → automate.",
    difficulty: "medium",
    experience: ["mid", "senior"],
    category: "QA Fundamentals",
    tags: ["test strategy", "manual vs automation", "ROI"],
  },

  /* ══════════════════════════════════════════════════════
     LOGICAL THINKING
  ══════════════════════════════════════════════════════ */
  {
    id: "logic-1",
    question: "You run 200 tests overnight. Next morning 15 tests failed. How do you triage and prioritize fixing them?",
    answer:
      "Systematic triage approach:\n\n" +
      "**Step 1 — Categorise failures:**\n" +
      "• Open the HTML report; look for common patterns (same error message, same page, same time of failure)\n" +
      "• Group into: environment issue | test code bug | application bug | flakiness\n\n" +
      "**Step 2 — Check if it's environment:**\n" +
      "• Did other tests in the same suite pass? If almost everything failed → CI environment or build issue\n" +
      "• Check if the app deployed correctly in that environment\n\n" +
      "**Step 3 — Look at traces/screenshots:**\n" +
      "• Download trace.zip for one failing test\n" +
      "• Find the exact line that threw — is it a Playwright timeout or an assertion error?\n\n" +
      "**Step 4 — Prioritise:**\n" +
      "1. High-impact bugs blocking core user flows → escalate immediately\n" +
      "2. Test code issues → fix in a quick PR\n" +
      "3. Flaky tests → add retry, open ticket to investigate root cause\n\n" +
      "**Step 5 — Prevent recurrence:**\n" +
      "• Add `retries: 1` for known flaky areas; quarantine tests that flap >3% of runs",
    difficulty: "logical",
    experience: ["mid", "senior"],
    category: "Debugging",
    tags: ["triage", "debugging", "flaky tests", "problem solving"],
  },
  {
    id: "logic-2",
    question: "A `getByRole('button', { name: 'Submit' })` locator times out even though the button is visually there. What do you check?",
    answer:
      "Systematic checklist:\n\n" +
      "1. **Check the actual role** – open DevTools → Accessibility tree. The element might be `<div role='button'>` (which `getByRole` does find) or just `<div>` with no role (which it won't find without `exact: false` or using a different strategy)\n" +
      "2. **Check the accessible name** – the button's accessible name might differ from visible text. Could be `aria-label`, `aria-labelledby`, or an icon button with no text → use `page.pause()` and hover over the Playwright locator panel\n" +
      "3. **Is it inside a shadow DOM?** – Playwright auto-pierces shadow DOM but the element might be inside a cross-origin iframe\n" +
      "4. **Is it inside an iframe?** – use `page.frameLocator('iframe').getByRole('button', { name: 'Submit' })` to scope into the frame\n" +
      "5. **Is it covered/disabled?** – auto-waiting checks for enabled; a `disabled` attribute prevents the action and throws a different error\n" +
      "6. **Multiple matches?** – if there are two Submit buttons, Playwright throws a strict mode violation — use `.first()` or narrow the scope with a parent locator",
    difficulty: "logical",
    experience: ["mid", "senior"],
    category: "Debugging",
    tags: ["debugging", "locator", "timeout", "ARIA", "iframe"],
  },
  {
    id: "logic-3",
    question: "Your E2E test suite takes 45 minutes to run. The business wants it under 10 minutes. What's your plan?",
    answer:
      "**Analysis first (don't guess):**\n" +
      "• Profile: which tests take longest? (HTML report shows duration per test)\n" +
      "• Identify the slowest 20% that consume 80% of time\n\n" +
      "**Quick wins:**\n" +
      "• Enable `fullyParallel: true` — if currently sequential → immediate 4-8× speedup\n" +
      "• Reuse auth state via `storageState` — cut login time across all tests\n" +
      "• Move UI-only setup to API calls (seed data via API, not UI forms)\n\n" +
      "**Architectural changes:**\n" +
      "• Shard across 4-5 CI runners → proportional speedup\n" +
      "• Introduce test tiers: `@smoke` (2 min), `@critical` (10 min), `@regression` (full)\n" +
      "• Push unit-level checks down from E2E to component/unit tests\n\n" +
      "**Target: 45 min → 10 min:**\n" +
      "• Parallelism alone (4 workers): ~45/4 = ~11 min\n" +
      "• Remove 20 slowest redundant tests: ~9 min\n" +
      "• Apply API seeding: ~8 min",
    difficulty: "logical",
    experience: ["senior", "lead"],
    category: "Framework Design",
    tags: ["performance", "optimization", "parallel", "strategy"],
  },

  /* ══════════════════════════════════════════════════════
     BEHAVIORAL & LEADERSHIP
  ══════════════════════════════════════════════════════ */
  {
    id: "lead-1",
    question: "How do you get developers to write testable code and support QA automation efforts?",
    answer:
      "**Build relationships, not walls:**\n" +
      "• Sit with devs during sprint planning — identify testability issues early\n" +
      "• Advocate for `data-testid` attributes as part of Definition of Done\n" +
      "• Pair with devs on the first few test implementations — they'll appreciate the value\n\n" +
      "**Make it easy:**\n" +
      "• Provide a `data-testid` naming convention guide\n" +
      "• Share the automation framework with clear README — devs can write their own tests\n" +
      "• PR template includes a \"Test coverage added?\" checkbox\n\n" +
      "**Show value:**\n" +
      "• Demonstrate how flaky tests correlate with bugs caught in staging\n" +
      "• Show the dashboard of bugs caught by automation before reaching prod\n" +
      "• Celebrate shared wins when automation prevents a prod incident",
    difficulty: "leadership",
    experience: ["senior", "lead"],
    category: "Behavioral & Leadership",
    tags: ["leadership", "collaboration", "developers", "culture"],
  },
  {
    id: "lead-2",
    question: "Describe a time you had to push back on a decision that would have hurt test quality.",
    answer:
      "**Framework for answering (STAR):**\n\n" +
      "**Situation**: The team was under pressure to release faster and the PM suggested skipping regression tests for a 'small' change.\n\n" +
      "**Task**: As QA lead, I needed to communicate the risk without blocking the team or being adversarial.\n\n" +
      "**Action**:\n" +
      "• Pulled historical data: last 5 times we skipped regression, 2 resulted in prod bugs\n" +
      "• Proposed a compromise: run a targeted smoke suite (15 min) instead of full regression (45 min) scoped to the changed module\n" +
      "• Documented the risk formally in Jira so the decision was visible to stakeholders\n\n" +
      "**Result**: The team agreed to the targeted approach. The smoke suite caught one edge case. Full regression was run next sprint with no issues.\n\n" +
      "**Lesson**: Frame pushback as risk communication with data, offer alternatives, and document outcomes to build long-term credibility.",
    difficulty: "leadership",
    experience: ["senior", "lead"],
    category: "Behavioral & Leadership",
    tags: ["leadership", "conflict", "quality advocate", "STAR"],
  },
  {
    id: "lead-3",
    question: "How do you measure the success and ROI of a QA automation initiative?",
    answer:
      "**Key metrics to track:**\n\n" +
      "**Efficiency metrics:**\n" +
      "• Test execution time before vs after automation\n" +
      "• Manual hours saved per sprint (tracked via estimation)\n" +
      "• Cost per test run (CI minutes × cost)\n\n" +
      "**Quality metrics:**\n" +
      "• Defect escape rate (bugs found in prod vs caught by automation)\n" +
      "• Test coverage (% of user stories with automated tests)\n" +
      "• Flaky test rate (target: <2%)\n" +
      "• Mean time to detect (how quickly automation catches a regression)\n\n" +
      "**ROI calculation:**\n" +
      "• ROI = (Manual testing cost saved - Automation investment) / Automation investment × 100\n" +
      "• Automation investment = build time + maintenance time + infra cost\n\n" +
      "**Business impact:**\n" +
      "• Deployment frequency increase\n" +
      "• Reduction in hotfixes/rollbacks\n" +
      "• Faster feature delivery",
    difficulty: "leadership",
    experience: ["senior", "lead"],
    category: "Behavioral & Leadership",
    tags: ["ROI", "metrics", "leadership", "quality engineering"],
  },
  {
    id: "lead-4",
    question: "How do you onboard a new QA engineer to a complex automation framework?",
    answer:
      "**Week 1 — Foundation:**\n" +
      "• README walkthrough: framework structure, how to run tests, how to add a test\n" +
      "• Pair on running the suite locally; fix any setup friction (update README as you go)\n" +
      "• Give a 'starter task': write one new test for an existing feature\n\n" +
      "**Week 2 — Contribution:**\n" +
      "• Review their first PR thoroughly — explain POM conventions, locator best practices\n" +
      "• Introduce fixtures, custom test extensions, shared utilities\n" +
      "• Walk through the CI pipeline and how to read failure reports\n\n" +
      "**Week 3+ — Independence:**\n" +
      "• Assign a small feature to test end-to-end (design + implement)\n" +
      "• Regular 1:1s to unblock and answer questions\n" +
      "• Gradually reduce pairing as confidence grows\n\n" +
      "**Documentation:**\n" +
      "• Keep a 'decisions log' explaining why the framework was designed certain ways\n" +
      "• Maintain a style guide with examples",
    difficulty: "leadership",
    experience: ["senior", "lead"],
    category: "Behavioral & Leadership",
    tags: ["onboarding", "mentoring", "leadership", "team"],
  },
  {
    id: "lead-5",
    question: "What is shift-left testing and how have you applied it in your work?",
    answer:
      "**Shift-left testing** means moving testing activities earlier in the SDLC — before code is written, not after.\n\n" +
      "**Practical approaches:**\n" +
      "• **Requirements review**: QA reviews user stories before sprint start, identifies ambiguity and missing acceptance criteria\n" +
      "• **Test design in sprint planning**: Write test scenarios for a story before implementation begins\n" +
      "• **TDD/BDD collaboration**: QA writes Gherkin scenarios; devs implement against them\n" +
      "• **PR-level testing**: Developers run unit + component tests locally before pushing\n" +
      "• **Testability reviews**: QA flags architecturally untestable designs in design reviews\n\n" +
      "**Result**: Bugs found in requirements/design cost 10× less to fix than bugs found in production (IBM/NIST studies).\n\n" +
      "**Applied example**: By reviewing stories before sprint start, our team reduced 'definition of done' failures by 35% and cut regression bugs per release by half.",
    difficulty: "leadership",
    experience: ["mid", "senior", "lead"],
    category: "Behavioral & Leadership",
    tags: ["shift-left", "strategy", "SDLC", "quality engineering"],
  },

  /* ══════════════════════════════════════════════════════
     VERY HARD — Advanced topics
  ══════════════════════════════════════════════════════ */
  {
    id: "adv-1",
    question: "Explain Playwright's Component Testing (`@playwright/experimental-ct-react`). How does it differ from E2E testing?",
    answer:
      "Playwright Component Testing mounts individual React/Vue/Svelte components in a real browser environment — without needing a full running application server.\n\n" +
      "**How it works:**\n" +
      "• Uses Vite to bundle and serve the component in isolation\n" +
      "• `mount(Component, { props })` renders the component; returns a Locator for interaction\n" +
      "• Full Playwright assertions and interactions available\n\n" +
      "**Differs from E2E:**\n" +
      "• No server, no routing — component receives mock props directly\n" +
      "• Much faster than E2E (no login, no navigation)\n" +
      "• Focused: tests only the component's UI behaviour\n" +
      "• Complements E2E; doesn't replace it",
    code:
      `import { test, expect } from '@playwright/experimental-ct-react';
import LoginForm from './LoginForm';

test('shows error on empty submit', async ({ mount }) => {
  const component = await mount(<LoginForm onLogin={jest.fn()} />);
  await component.getByRole('button', { name: 'Sign In' }).click();
  await expect(component.getByText('Email is required')).toBeVisible();
});`,
    language: "typescript",
    difficulty: "very-hard",
    experience: ["senior", "lead"],
    category: "Playwright Basics",
    tags: ["component testing", "React", "advanced", "Vite"],
  },
  {
    id: "adv-2",
    question: "How do you handle testing inside iframes with Playwright?",
    answer:
      "Use `page.frameLocator(selector)` to scope all locator queries to within the iframe.\n\n" +
      "Important caveats:\n" +
      "• `frameLocator` returns a `FrameLocator` — not a `Frame` or `Page`\n" +
      "• Cross-origin iframes: Playwright can interact with them (unlike Selenium) because it communicates at the browser protocol level\n" +
      "• For deep nesting: chain `frameLocator` calls\n" +
      "• `page.frame(nameOrUrl)` returns a `Frame` object for direct navigation/evaluation within the frame",
    code:
      `// Basic iframe interaction
const iframe = page.frameLocator('iframe[title="Payment form"]');
await iframe.getByLabel('Card number').fill('4242424242424242');
await iframe.getByLabel('Expiry').fill('12/26');
await iframe.getByRole('button', { name: 'Pay' }).click();

// Nested iframes
const inner = page.frameLocator('#outer-frame').frameLocator('#inner-frame');
await inner.getByText('Confirm').click();`,
    language: "typescript",
    difficulty: "very-hard",
    experience: ["senior", "lead"],
    category: "Locators & Selectors",
    tags: ["iframe", "frameLocator", "cross-origin", "advanced"],
  },
  {
    id: "adv-3",
    question: "What is Playwright's clock API and when would you use it?",
    answer:
      "Playwright v1.45+ ships a `page.clock` API that freezes or manipulates browser time:\n\n" +
      "• `page.clock.install({ time })` – freeze at a specific date\n" +
      "• `page.clock.tick(ms)` – advance time by N milliseconds\n" +
      "• `page.clock.runFor(ms)` – run any pending timers within the window\n\n" +
      "**Use cases:**\n" +
      "• Testing time-sensitive UI (countdown timers, session expiry warnings, date pickers)\n" +
      "• Preventing flakiness from `Date.now()` or `setTimeout` in the app\n" +
      "• Testing 'show toast for 5 seconds' behaviour without actually waiting 5s",
    code:
      `test('session expires after 30 minutes of inactivity', async ({ page }) => {
  await page.clock.install({ time: new Date('2025-01-01T10:00:00') });
  await page.goto('/dashboard');
  // Advance time by 31 minutes
  await page.clock.tick(31 * 60 * 1000);
  await expect(page.getByText('Session expired')).toBeVisible();
});`,
    language: "typescript",
    difficulty: "very-hard",
    experience: ["senior", "lead"],
    category: "Playwright Basics",
    tags: ["clock", "time", "advanced", "flakiness"],
  },
  {
    id: "adv-4",
    question: "How does Playwright handle WebSockets and real-time features?",
    answer:
      "Playwright can observe and mock WebSocket messages through the `page.on('websocket', ws => …)` API.\n\n" +
      "**Observing WS traffic:**\n" +
      "```ts\npage.on('websocket', ws => {\n  ws.on('framereceived', frame => console.log(frame.payload));\n});\n```\n\n" +
      "**Mocking WS (v1.48+):**\n" +
      "```ts\nawait page.routeWebSocket('wss://api.example.com/ws', ws => {\n  ws.onMessage(msg => {\n    if (msg === 'ping') ws.send('pong');\n  });\n});\n```\n\n" +
      "**Testing real-time UI:**\n" +
      "• Navigate to the page, perform an action that triggers a WS message, assert the UI updates\n" +
      "• Use `expect(locator).toHaveText()` — it auto-retries until the WS update arrives",
    difficulty: "very-hard",
    experience: ["senior", "lead"],
    category: "Playwright Basics",
    tags: ["WebSocket", "real-time", "advanced", "routeWebSocket"],
  },
  {
    id: "adv-5",
    question: "Explain how to integrate Playwright with Allure reporting and why you might choose it over the built-in HTML report.",
    answer:
      "**Install:**\n" +
      "```bash\nnpm i -D allure-playwright allure-commandline\n```\n\n" +
      "**Configure reporter in `playwright.config.ts`:**\n" +
      "```ts\nreporter: [['allure-playwright', { detail: true, outputFolder: 'allure-results' }]]\n```\n\n" +
      "**Generate & serve:**\n" +
      "```bash\nnpx allure generate allure-results --clean -o allure-report\nnpx allure open allure-report\n```\n\n" +
      "**Why Allure over built-in:**\n" +
      "• Rich test history and trend charts across multiple runs\n" +
      "• Suite-level categories (broken / failed / passed / skipped)\n" +
      "• Better defect classification\n" +
      "• JIRA / Xray integration\n" +
      "• More granular step-level reporting with `allure.step('…', async () => {})`\n\n" +
      "**Built-in HTML report** is sufficient for local development; Allure shines in enterprise CI with historical dashboards.",
    difficulty: "hard",
    experience: ["senior", "lead"],
    category: "CI/CD & Reporting",
    tags: ["Allure", "reporting", "CI/CD", "observability"],
  },
];
