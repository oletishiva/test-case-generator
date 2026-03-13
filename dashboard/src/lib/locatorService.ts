/*
  LocatorService — ported from src/services/locatorService.ts
  Pure TypeScript, no runtime dependencies.
  Accepts an LLM generate function via dependency injection.
*/

export type LLMGenerateFn = (prompt: string) => Promise<string>;

export interface LocatorServiceOptions {
  preferredStrategy?: "role" | "text" | "label" | "placeholder" | "alt" | "title" | "testid" | "css";
  framework?: "playwright" | "cypress" | "selenium";
  groupIntoPOM?: boolean;
  language?: "typescript" | "javascript" | "python" | "java";
  includeActions?: boolean;
  includeDynamicLocators?: boolean;
  ignoreSections?: string;
  lazyInit?: boolean;
}

export class LocatorService {
  private generateFn: LLMGenerateFn;

  constructor(generateFn: LLMGenerateFn) {
    this.generateFn = generateFn;
  }

  private buildPriorityOrder(preferred?: LocatorServiceOptions["preferredStrategy"]): string[] {
    const order = ["role", "text", "label", "placeholder", "alt", "title", "testid", "css"];
    if (!preferred) return order;
    const without = order.filter((s) => s !== preferred);
    return [preferred, ...without];
  }

  private toPlaywrightName(strategy: string): string {
    switch (strategy) {
      case "role":        return "page.getByRole()";
      case "text":        return "page.getByText()";
      case "label":       return "page.getByLabel()";
      case "placeholder": return "page.getByPlaceholder()";
      case "alt":         return "page.getByAltText()";
      case "title":       return "page.getByTitle()";
      case "testid":      return "page.getByTestId()";
      default:            return "page.locator()";
    }
  }

  private toPythonName(strategy: string): string {
    switch (strategy) {
      case "role":        return "page.get_by_role()";
      case "text":        return "page.get_by_text()";
      case "label":       return "page.get_by_label()";
      case "placeholder": return "page.get_by_placeholder()";
      case "alt":         return "page.get_by_alt_text()";
      case "title":       return "page.get_by_title()";
      case "testid":      return "page.get_by_test_id()";
      default:            return "page.locator()";
    }
  }

  private buildPrompt(input: string, options: LocatorServiceOptions): string {
    const lang = options.language ?? "typescript";
    const isTS  = lang === "typescript";
    const isJS  = lang === "javascript";
    const isPy  = lang === "python";
    // Java = anything else
    const isLazy         = options.lazyInit === true;
    const includeActions = options.includeActions !== false;
    const includeDynamic = options.includeDynamicLocators === true;

    const langLabel = isTS ? "TypeScript" : isJS ? "JavaScript" : isPy ? "Python" : "Java";
    const framework = options.framework ?? "Playwright";

    const order = this.buildPriorityOrder(options.preferredStrategy);
    const orderReadable = order
      .map((s, i) => `${i + 1}) ${isPy ? this.toPythonName(s) : this.toPlaywrightName(s)}`)
      .join("\n");

    /* ── Language output rules ── */
    let langOutputRules: string;
    if (isPy) {
      langOutputRules = isLazy
        ? `- Output syntactically correct Python only; do not wrap in markdown fences.
- Use snake_case for ALL field and method names.
- Use @property decorator for EVERY locator (lazy initialization):
  @property
  def email_field(self) -> Locator:
      return self.page.get_by_label("Email")
- Constructor only stores page: def __init__(self, page: Page) -> None: / self.page = page
- Import at the top: from playwright.sync_api import Page, Locator`
        : `- Output syntactically correct Python only; do not wrap in markdown fences.
- Use snake_case for ALL field and method names.
- Playwright Python sync API: get_by_label(), get_by_role(), get_by_placeholder(), get_by_text(), get_by_test_id(), get_by_alt_text(), get_by_title(), locator()
- Class pattern:
  from playwright.sync_api import Page, Locator
  class LoginPage:
      def __init__(self, page: Page) -> None:
          self.page = page
          self.email_field: Locator = page.get_by_label("Email")
- Action methods: def click_sign_in(self) -> None: / self.sign_in_button.click()`;
    } else if (!isTS && !isJS) { // Java
      langOutputRules = isLazy
        ? `- Output syntactically correct Java only; do not wrap in markdown fences.
- Use camelCase for field and method names.
- Implement locators as public getter methods (lazy initialization pattern):
  public Locator emailField() { return page.getByLabel("Email"); }
- Class pattern:
  import com.microsoft.playwright.*;
  import com.microsoft.playwright.options.AriaRole;
  public class LoginPage {
      private final Page page;
      public LoginPage(Page page) { this.page = page; }
      public Locator emailField() { return page.getByLabel("Email"); }
  }`
        : `- Output syntactically correct Java only; do not wrap in markdown fences.
- Use camelCase for field and method names.
- Class pattern with private final Locator fields:
  import com.microsoft.playwright.*;
  import com.microsoft.playwright.options.AriaRole;
  public class LoginPage {
      private final Page page;
      private final Locator emailField;
      public LoginPage(Page page) {
          this.page = page;
          this.emailField = page.getByLabel("Email");
      }
  }
- For getByRole with name: page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"))
- Action methods: public void clickSignIn() { signInButton.click(); } / public void setEmail(String v) { emailField.fill(v); }`;
    } else if (isTS) {
      langOutputRules = isLazy
        ? `- Output syntactically correct TypeScript only; do not wrap in markdown fences.
- Implement the class using TypeScript getter properties for EVERY locator (lazy initialization pattern). Each getter returns a fresh Locator on each access:
  get emailField(): Locator { return this.page.getByLabel('Email'); }
  Multi-line style is also fine:
  get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }
- Store page in constructor: constructor(private readonly page: Page) {}
- Import at the top: import { Page, Locator } from '@playwright/test';`
        : `- Output syntactically correct TypeScript only; do not wrap in markdown fences.
- Implement the class using private readonly Locator fields initialized in the constructor (not computed getters) for performance and clarity.
- Import at the top: import { Page, Locator } from '@playwright/test';`;
    } else { // JavaScript
      langOutputRules = isLazy
        ? `- Output syntactically correct JavaScript only; do NOT include TypeScript types, generics, or annotations.
- Use getter properties for EVERY locator (lazy initialization):
  get emailField() { return this.page.getByLabel('Email'); }
- Store page in constructor: constructor(page) { this.page = page; }
- No import statements needed.`
        : `- Output syntactically correct JavaScript only; do NOT include TypeScript types, generics, or annotations.
- Use plain ES2020 class syntax. All fields assigned in constructor as this.fieldName = page.getByXxx(...).
- No import statements needed.`;
    }

    /* ── Action rules ── */
    let actionRules: string;
    if (!includeActions) {
      actionRules = `- Do NOT generate any action methods (click, fill, navigate, etc.) — only locator fields/properties.`;
    } else if (isPy) {
      actionRules = `- Input fields: def set_xxx(self, value: str) -> None: / self.xxx_field.fill(value)
- Buttons/links: def click_xxx(self) -> None: / self.xxx_button.click()
- Static content: only @property locators (lazy) or plain fields.
- If both username and password exist: def login(self, username: str, password: str) -> None:
- Helpers when applicable: def is_forgot_password_visible(self) -> bool: / def is_logo_visible(self) -> bool:`;
    } else if (!isTS && !isJS) { // Java
      actionRules = `- Input fields: public void setXxx(String value) { xxxField.fill(value); }
- Buttons/links: public void clickXxx() { xxxButton.click(); }
- Static content: only locator fields/getters.
- If both username and password exist: public void login(String username, String password)
- Helpers when applicable: public boolean isForgotPasswordVisible() / public boolean isLogoVisible()`;
    } else {
      actionRules = `- Inputs/textareas/selects: create setters (fill/select) and getters when useful.
- Buttons/links: create action methods like click/select.
- Static content (headings/labels): only getters.
- If both username and password fields exist, include a convenience method: async login(username${isTS ? ": string" : ""}, password${isTS ? ": string" : ""}).
- Add two tiny helpers when applicable: async isForgotPasswordVisible(), async logoIsVisible().`;
    }

    /* ── Dynamic locators section ── */
    let dynamicSection = "";
    if (includeDynamic) {
      if (isPy) {
        dynamicSection = `\nDynamic/Parameterized Locators (REQUIRED — include in addition to regular fields):
- def get_row_by_text(self, text: str) -> Locator: return self.page.get_by_role("row").filter(has_text=text)
- def get_product_card(self, index: int) -> Locator: return self.page.locator("[data-card], .card, .product").nth(index)
- def get_list_item(self, index: int) -> Locator: return self.page.locator("li").nth(index)
- Apply wherever repeating/dynamic content exists on the page.`;
      } else if (!isTS && !isJS) { // Java
        dynamicSection = `\nDynamic/Parameterized Locators (REQUIRED — include in addition to regular fields):
- public Locator getRowByText(String text) { return page.getByRole(AriaRole.ROW).filter(new Locator.FilterOptions().setHasText(text)); }
- public Locator getProductCard(int index) { return page.locator("[data-card], .card, .product").nth(index); }
- public Locator getListItem(int index) { return page.locator("li").nth(index); }
- Apply wherever repeating/dynamic content exists on the page.`;
      } else {
        dynamicSection = `\nDynamic/Parameterized Locators (REQUIRED — include in addition to regular fields):
- Generate parameterized methods for tables, lists, cards, and repeating element patterns found on the page.
- Row pattern: async getRowByText(text${isTS ? ": string" : ""})${isTS ? ": Locator" : ""} { return this.page.getByRole('row').filter({ hasText: text }); }
- Card pattern: async getProductCard(index${isTS ? ": number" : ""})${isTS ? ": Locator" : ""} { return this.page.locator('[data-card], .card, .product').nth(index); }
- List item: async getListItem(index${isTS ? ": number" : ""})${isTS ? ": Locator" : ""} { return this.page.locator('li').nth(index); }
- Apply wherever repeating/dynamic content exists on the page.`;
      }
    }

    const ignoreRule = options.ignoreSections?.trim()
      ? `\n- IMPORTANT: Completely ignore and do NOT generate locators for these sections: ${options.ignoreSections.trim()}.`
      : "";

    return `You are an expert ${langLabel} ${framework} engineer. Generate production-ready ${langLabel} Page Object Model code.

Goal:
Given an HTML DOM source, component snippet, or page description, generate locators using the preferred built-in locator priority order. Generate corresponding getter/setter/action methods where applicable.

Locator Priority Order (highest first):
${orderReadable}

Rules:
- Prefer semantic locators (role, text, label, placeholder, alt, title, testid) before CSS/XPath.
- If an element has both visible text and role, prefer the role locator.
- For input fields with a placeholder attribute, prefer the placeholder locator over label regardless of the global priority order.
- Avoid dynamic ids, random classes, or auto-generated CSS; only use CSS/XPath if nothing semantic exists.
- ${isPy ? "Use snake_case names and concise, production-ready POM style." : "Use camelCase names and concise, production-ready POM style."}
- For social links, prefer role('link') with the link text if accessible names are present; otherwise fall back to href-based CSS selectors.${ignoreRule}

Action methods:
${actionRules}
${dynamicSection}

Screenshot/image-specific rules:
- Derive locator names ONLY from visible text in the image or explicit hints in the input. Do NOT invent placeholders or labels.
- Prefer the text-based locator for static text, headings, and button/links; use exact match when appropriate.
- Never output text values that are not present in the provided image/input.

${langLabel} output rules:
${langOutputRules}

Input:
${input}

Output:
- A single ${langLabel} class named based on the page context (fallback: GeneratedPage)
- Include locator fields and methods as configured above
`;
  }

  async generate(input: string, options: LocatorServiceOptions = {}): Promise<string> {
    const prompt = this.buildPrompt(input, options);
    const raw = await this.generateFn(prompt);
    let code = raw.trim();
    if (code.startsWith("```")) {
      code = code.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim();
    }
    return code;
  }

  private buildMultiFilePrompt(input: string, pageName: string): string {
    return `You are a senior Playwright TypeScript automation engineer.

Given the following HTML DOM or page description, generate EXACTLY 4 TypeScript files for the page named "${pageName}".

Use semantic Playwright locators in this priority: getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > locator(css).

Output EXACTLY in this format with XML delimiters (no extra text outside the delimiters):

<LOCATORS>
// TypeScript content for file 1
</LOCATORS>

<PAGE_OBJECT>
// TypeScript content for file 2
</PAGE_OBJECT>

<STEP_DEFINITIONS>
// TypeScript content for file 3
</STEP_DEFINITIONS>

<TEST_SCENARIOS>
// TypeScript content for file 4
</TEST_SCENARIOS>

---

FILE 1 — ${pageName}.locators.ts (1_Locators folder)
- Export individual arrow-function locators (NOT a class), one per element
- Group with section comments (e.g., // === Form Fields ===)
- Pattern: export const loginHeading = (page: Page) => page.getByRole('heading', { name: 'Log in' });
- Import at top: import { Page } from '@playwright/test';

FILE 2 — ${pageName}.po.ts (2_Page-Object folder)
- TypeScript class: export class ${pageName}Page
- Constructor: constructor(private readonly page: Page) {}
- Lazy getters for EVERY locator: get loginHeading(): Locator { return this.page.getByRole(...); }
- Public async action methods: async enterUserId(userId: string) { await this.userIdInput.fill(userId); }
- Public async assertion helpers: async verifyHeadingVisible() { await expect(this.loginHeading).toBeVisible(); }
- Convenience methods where applicable (e.g., async login(user, pass))
- Imports: import { Page, Locator, expect } from '@playwright/test';

FILE 3 — ${pageName}.steps.ts (3_Step-Definitions folder)
- Reusable async step functions (NOT Cucumber — Playwright style)
- Each function takes page: Page as first param and creates the POM internally
- Cover: navigation, form filling, button clicks, assertions
- Pattern:
  export async function theUserEntersUserId(page: Page, userId: string) {
    const po = new ${pageName}Page(page);
    await po.enterUserId(userId);
  }
- Import the Page Object: import { ${pageName}Page } from '../2_Page-Object/${pageName}.po';
- Imports: import { Page } from '@playwright/test';

FILE 4 — ${pageName}.spec.ts (4_Test-Scenarios folder)
- Full Playwright test file with 4-6 meaningful test scenarios
- test.describe block, beforeEach sets up page and navigates
- Each test focuses on ONE specific user flow or validation
- Use the Page Object (NOT the locators file directly)
- Include positive + negative scenarios
- Pattern:
  import { test, expect } from '@playwright/test';
  import { ${pageName}Page } from '../2_Page-Object/${pageName}.po';

  test.describe('${pageName} Tests', () => {
    let po: ${pageName}Page;
    test.beforeEach(async ({ page }) => { po = new ${pageName}Page(page); await page.goto('/'); });
    test('should display all form elements', async ({ page }) => { ... });
  });

HTML/DOM Input:
${input}
`;
  }

  async generateMultiFile(
    input: string,
    pageName: string
  ): Promise<{ locators: string; pageObject: string; stepDefs: string; scenarios: string }> {
    const prompt = this.buildMultiFilePrompt(input, pageName);
    const raw = await this.generateFn(prompt);

    function extract(tag: string): string {
      const m = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
      if (!m) return `// ${tag} generation failed`;
      let code = m[1].trim();
      if (code.startsWith("```")) {
        code = code.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim();
      }
      return code;
    }

    return {
      locators:   extract("LOCATORS"),
      pageObject: extract("PAGE_OBJECT"),
      stepDefs:   extract("STEP_DEFINITIONS"),
      scenarios:  extract("TEST_SCENARIOS"),
    };
  }
}
