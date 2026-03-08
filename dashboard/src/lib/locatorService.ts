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
  language?: "typescript" | "javascript";
  includeActions?: boolean;
  includeDynamicLocators?: boolean;
  ignoreSections?: string;
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

  private buildPrompt(input: string, options: LocatorServiceOptions): string {
    const order = this.buildPriorityOrder(options.preferredStrategy);
    const orderReadable = order
      .map((s, i) => `${i + 1}) ${this.toPlaywrightName(s)}`)
      .join("\n");

    const lang = options.language === "javascript" ? "JavaScript" : "TypeScript";
    const isTS = lang === "TypeScript";
    const includeActions = options.includeActions !== false; // default true
    const includeDynamic = options.includeDynamicLocators === true;

    const langOutputRules = isTS
      ? `- Output syntactically correct TypeScript only; do not wrap in markdown fences.
- Implement the class using private readonly Locator fields initialized in the constructor (not computed getters) for performance and clarity.
- Import at the top: import { Page, Locator } from '@playwright/test';`
      : `- Output syntactically correct JavaScript only; do NOT include TypeScript types, generics, or annotations.
- Use plain ES2020 class syntax. All fields assigned in constructor as this.fieldName = page.getByXxx(...).
- No import statements needed.`;

    const actionRules = includeActions
      ? `- Inputs/textareas/selects: create setters (fill/select) and getters when useful.
- Buttons/links: create action methods like click/select.
- Static content (headings/labels): only getters.
- If both username and password fields exist, include a convenience method: async login(username${isTS ? ": string" : ""}, password${isTS ? ": string" : ""}).
- Add two tiny helpers when applicable: async isForgotPasswordVisible(), async logoIsVisible().`
      : `- Do NOT generate any action methods (click, fill, navigate, etc.) — only locator fields/properties.`;

    const dynamicSection = includeDynamic
      ? `\nDynamic/Parameterized Locators (REQUIRED — include in addition to regular fields):
- Generate parameterized methods for tables, lists, cards, and repeating element patterns found on the page.
- Row pattern: async getRowByText(text${isTS ? ": string" : ""})${isTS ? ": Locator" : ""} { return this.page.getByRole('row').filter({ hasText: text }); }
- Card pattern: async getProductCard(index${isTS ? ": number" : ""})${isTS ? ": Locator" : ""} { return this.page.locator('[data-card], .card, .product').nth(index); }
- List item: async getListItem(index${isTS ? ": number" : ""})${isTS ? ": Locator" : ""} { return this.page.locator('li').nth(index); }
- Apply wherever repeating/dynamic content exists on the page.`
      : "";

    const ignoreRule = options.ignoreSections?.trim()
      ? `\n- IMPORTANT: Completely ignore and do NOT generate locators for these sections: ${options.ignoreSections.trim()}.`
      : "";

    return `You are an expert ${lang} ${options.framework ?? "Playwright"} engineer. Generate production-ready ${lang} Page Object Model code.

Goal:
Given an HTML DOM source, component snippet, or page description, generate locators using the preferred built-in locator priority order. Generate corresponding getter/setter/action methods where applicable.

Locator Priority Order (highest first):
${orderReadable}

Rules:
- Prefer semantic locators (role, text, label, placeholder, alt, title, testid) before CSS/XPath.
- If an element has both visible text and role, prefer getByRole().
- For input fields with a placeholder attribute, prefer getByPlaceholder() over getByLabel() regardless of the global priority order.
- Avoid dynamic ids, random classes, or auto-generated CSS; only use CSS/XPath if nothing semantic exists.
- Use camelCase names and concise, production-ready POM style.
- For social links, prefer getByRole('link', { name: /LinkedIn|Facebook|Twitter|YouTube/i }) if accessible names are present; otherwise fall back to a[href*="linkedin.com"] etc.${ignoreRule}

Action methods:
${actionRules}
${dynamicSection}

Screenshot/image-specific rules:
- Derive locator names ONLY from visible text in the image or explicit hints in the input. Do NOT invent placeholders or labels.
- Prefer page.getByText('<exact visible text>') for static text, headings, and button/links; use { exact: true } when appropriate.
- Never output text values that are not present in the provided image/input.

${lang} output rules:
${langOutputRules}

Input:
${input}

Output:
- A single ${lang} class named based on the page context (fallback: GeneratedPage)
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
}
