"use strict";
/*
  Standalone LocatorService
  - No runtime dependency on other project services
  - Accepts a generate function (LLM) via dependency injection
  - Builds prompt from inputs and returns TS Page Object code
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocatorService = void 0;
class LocatorService {
    constructor(generateFn) {
        this.generateFn = generateFn;
    }
    buildPriorityOrder(preferred) {
        const order = ['role', 'text', 'label', 'placeholder', 'alt', 'title', 'testid', 'css'];
        if (!preferred)
            return order;
        const without = order.filter(s => s !== preferred);
        return [preferred, ...without];
    }
    toPlaywrightName(strategy) {
        switch (strategy) {
            case 'role': return 'page.getByRole()';
            case 'text': return 'page.getByText()';
            case 'label': return 'page.getByLabel()';
            case 'placeholder': return 'page.getByPlaceholder()';
            case 'alt': return 'page.getByAltText()';
            case 'title': return 'page.getByTitle()';
            case 'testid': return 'page.getByTestId()';
            default: return 'page.locator()';
        }
    }
    buildPrompt(input, options) {
        const order = this.buildPriorityOrder(options.preferredStrategy);
        const orderReadable = order
            .map((s, i) => `${i + 1}) ${this.toPlaywrightName(s)}`)
            .join('\n');
        // Core prompt based on user's specification
        return (`You are an expert Playwright engineer. Generate Playwright locators and concise Page Object Model code.

Goal:
Given an HTML DOM source, component snippet, or page screenshot description, generate Playwright locators in TypeScript using the preferred built-in locator priority order. Also, generate corresponding getter and setter methods wherever applicable.

Locator Priority Order (highest first):
${orderReadable}

 Rules:
- Prefer semantic locators (role, text, label, placeholder, alt, title, testid) before CSS/XPath.
- If an element has both visible text and role, prefer getByRole().
- Inputs/textareas/selects: create setters (fill/select) and getters when useful.
- Buttons/links: create action methods like click/select.
- Static content (headings/labels): only getters.
- Avoid dynamic ids, random classes, or auto-generated CSS; only use CSS/XPath if nothing semantic exists.
- Use camelCase names and concise, production-ready POM.
- Output syntactically correct TypeScript only; do not wrap in markdown fences.

 Screenshot/image-specific rules:
 - Derive locator names ONLY from visible text in the image or explicit hints provided in the input. Do NOT invent placeholders or labels.
 - Prefer page.getByText('<exact visible text>') for static text, headings, and button/links with visible captions; use { exact: true } when appropriate.
 - If an input shows a placeholder text in the image, prefer page.getByPlaceholder('<placeholder text>').
 - If a clear label text is visibly adjacent to an input, you may use page.getByLabel('<label text>').
 - If none of (text/placeholder/label) is visible, use page.getByRole with a generic role and no name; only then consider page.locator with a minimal, stable selector.
 - Never output text values that are not present in the provided image/input.

 Additional required conventions:
 - For input fields that have a placeholder attribute, prefer getByPlaceholder(...) over getByLabel(...) regardless of the global order.
 - Implement the class using private readonly Locator fields initialized in the constructor (not computed getters) for performance and clarity.
 - Always include action methods for inputs and buttons (e.g., set<Field>(), click<Button>()).
 - If both username and password fields exist, include a convenience method: async login(username: string, password: string).
 - Add two tiny helpers when applicable: async isForgotPasswordVisible(), async logoIsVisible().
 - For social links, prefer getByRole('link', { name: /LinkedIn|Facebook|Twitter|YouTube/i }) if accessible names are present; otherwise, fall back to CSS selectors like a[href*="linkedin.com"].

Input:
${input}

Output:
- A single TypeScript class named based on the page context (fallback: GeneratedPage)
- Import types if necessary (assume Playwright's Page is available in context)
- Include locator fields and methods (setters/getters/actions)
`);
    }
    async generate(input, options = {}) {
        const prompt = this.buildPrompt(input, options);
        const raw = await this.generateFn(prompt);
        // Strip code fences if model includes them
        let code = raw.trim();
        if (code.startsWith('```')) {
            code = code.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim();
        }
        return code;
    }
}
exports.LocatorService = LocatorService;
//# sourceMappingURL=locatorService.js.map