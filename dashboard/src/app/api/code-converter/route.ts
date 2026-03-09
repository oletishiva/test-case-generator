import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* ── Source framework labels ── */
const SOURCE_LABELS: Record<string, string> = {
  "selenium-java":   "Selenium WebDriver (Java / TestNG / JUnit)",
  "selenium-python": "Selenium WebDriver (Python / pytest)",
  "selenium-js":     "Selenium WebDriver (JavaScript / Mocha)",
  "cypress":         "Cypress (JavaScript / TypeScript)",
  "webdriverio":     "WebDriverIO (JavaScript / TypeScript)",
  "appium-java":     "Appium (Java)",
  "appium-python":   "Appium (Python)",
  "protractor":      "Protractor (JavaScript / TypeScript)",
  "nightwatch":      "Nightwatch.js",
  "puppeteer":       "Puppeteer (JavaScript / TypeScript)",
};

/* ── Target language labels ── */
const TARGET_LABELS: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python:     "Python",
  java:       "Java",
};

/* ── Build the conversion prompt ── */
function buildPrompt(
  sourceCode: string,
  sourceFramework: string,
  targetLanguage: string,
): string {
  const srcLabel = SOURCE_LABELS[sourceFramework] ?? sourceFramework;
  const tgtLabel = TARGET_LABELS[targetLanguage] ?? targetLanguage;
  const isTS  = targetLanguage === "typescript";
  const isJS  = targetLanguage === "javascript";
  const isPy  = targetLanguage === "python";
  const isJava = targetLanguage === "java";

  const langRules = isTS
    ? `- Output: syntactically correct TypeScript only. Do NOT wrap in markdown fences.
- Use \`import { Page, Locator } from '@playwright/test';\` at the top.
- POM classes use \`private readonly\` field syntax.
- Tests use \`import { test, expect } from '@playwright/test';\`.
- Async/await throughout.`
    : isJS
    ? `- Output: syntactically correct JavaScript (ES2020+) only. Do NOT wrap in markdown fences.
- No TypeScript types or annotations.
- Use \`const { test, expect } = require('@playwright/test');\` for tests or ES module imports.
- POM classes use plain class syntax.
- Async/await throughout.`
    : isPy
    ? `- Output: syntactically correct Python only. Do NOT wrap in markdown fences.
- Use \`from playwright.sync_api import Page, Locator, expect\` (sync API).
- POM classes: \`def __init__(self, page: Page) -> None\` with \`self.page = page\`.
- Field-style locators: \`self.submit_btn = page.get_by_role("button", name="Submit")\`.
- Tests: \`from playwright.sync_api import sync_playwright\` or pytest fixtures.
- snake_case for all names.`
    : `- Output: syntactically correct Java only. Do NOT wrap in markdown fences.
- Use \`import com.microsoft.playwright.*;\` at the top.
- POM classes have \`private final Page page;\` and \`private final Locator\` fields.
- AriaRole enum: \`page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"))\`.
- Tests use JUnit 5 (\`@Test\`, \`@BeforeEach\`, \`@AfterEach\`).
- camelCase for all names.`;

  const locatorGuide = isPy
    ? `  • driver.find_element(By.ID, "x")      → page.locator("#x")  or  page.get_by_label("…")
  • driver.find_element(By.XPATH, "//…")  → page.get_by_role(…) or page.locator("xpath=//…")
  • driver.find_element(By.CSS_SELECTOR)  → page.locator("css")
  • element.click()                       → locator.click()
  • element.send_keys("text")             → locator.fill("text")
  • element.text                          → locator.text_content()
  • WebDriverWait + EC.visibility_of      → REMOVE (Playwright auto-waits)
  • assertEqual / assert …               → expect(locator).to_be_visible() / to_have_text(…)`
    : isJava
    ? `  • driver.findElement(By.id("x"))        → page.locator("#x")  or  page.getByLabel("…")
  • driver.findElement(By.xpath("//…"))   → page.getByRole(…) or page.locator("xpath=//…")
  • driver.findElement(By.cssSelector)    → page.locator("css")
  • element.click()                       → locator.click()
  • element.sendKeys("text")              → locator.fill("text")
  • element.getText()                     → locator.textContent()
  • WebDriverWait + ExpectedConditions    → REMOVE (Playwright auto-waits)
  • Assert.assertEquals(…)               → assertThat(locator).hasText(…)`
    : `  • driver.findElement(By.id('x'))        → page.locator('#x')  or  page.getByLabel('…')
  • driver.findElement(By.xpath('//…'))   → page.getByRole(…) or page.locator('xpath=//…')
  • driver.findElement(By.css('…'))       → page.locator('css')
  • element.click()                       → await locator.click()
  • element.sendKeys('text')             → await locator.fill('text')
  • element.getText()                     → await locator.textContent()
  • WebDriverWait / browser.waitUntil    → REMOVE (Playwright auto-waits)
  • assert.equal / cy.should             → await expect(locator).toHaveText(…)`;

  return `You are a senior QA engineer and test automation architect specialising in migrating legacy test code to Playwright.

Task:
Convert the following ${srcLabel} test code to ${tgtLabel} Playwright code.

Conversion rules:
1. Map every Selenium/Cypress/other locator to the most semantic Playwright equivalent (prefer getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > locator).
2. Replace ALL explicit waits, sleep calls, and WebDriverWait patterns — Playwright auto-waits. DELETE them entirely.
3. Preserve the original test intent, structure (class names, method names, describe blocks) and all assertions.
4. Convert assertions to Playwright's \`expect()\` API with retry.
5. If a Page Object Model class is present, preserve and convert it fully.
6. Add brief inline comments ONLY where the mapping is non-obvious.
7. Do NOT add extra features, boilerplate, or tests that weren't in the source.

Locator mapping guide:
${locatorGuide}

Output language rules:
${langRules}

Migration notes (IMPORTANT — append at the bottom as a comment block):
After the converted code, add a comment section titled "Migration Notes" listing:
- Any manual steps the developer must take (e.g. install @playwright/test, update package.json)
- Any patterns that could not be auto-converted (e.g. custom driver extensions, browser-specific flags)
- Configuration changes needed (playwright.config.ts)

Source code to convert:
\`\`\`
${sourceCode}
\`\`\`

Output:
Only the converted ${tgtLabel} code + Migration Notes comment block. No markdown fences.`;
}

/* ── LLM providers ── */
async function withGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  const delays = [500, 1500, 3000];
  for (const modelName of models) {
    for (let attempt = 0; attempt < delays.length; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { maxOutputTokens: 8192, temperature: 0.1 },
        });
        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.() ?? "";
        if (!text) throw new Error("Empty response");
        return text;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const isOverloaded = /overloaded|unavailable|503/i.test(msg);
        if (isOverloaded && attempt < delays.length - 1) {
          await new Promise((r) => setTimeout(r, delays[attempt]));
          continue;
        }
        if (isOverloaded) break;
        throw err;
      }
    }
  }
  throw new Error("Gemini temporarily unavailable");
}

async function withAnthropic(prompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });
  const c = msg.content[0];
  return c.type === "text" ? c.text : "";
}

async function withOpenAI(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0]?.message?.content ?? "";
}

/* ── POST handler ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sourceCode       = "",
      sourceFramework  = "selenium-java",
      targetLanguage   = "typescript",
    } = body as {
      sourceCode: string;
      sourceFramework: string;
      targetLanguage: string;
    };

    if (!sourceCode.trim()) {
      return NextResponse.json({ error: "sourceCode is required" }, { status: 400 });
    }

    const prompt = buildPrompt(sourceCode.trim(), sourceFramework, targetLanguage);

    const providers: { name: string; fn: (p: string) => Promise<string> }[] = [
      { name: "gemini",    fn: withGemini },
      { name: "anthropic", fn: withAnthropic },
      { name: "openai",    fn: withOpenAI },
    ];

    const errors: Record<string, string> = {};
    for (const { name, fn } of providers) {
      try {
        let code = (await fn(prompt)).trim();
        // Strip accidental markdown fences
        if (code.startsWith("```")) {
          code = code.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim();
        }
        if (!code) throw new Error("Empty result");
        console.log(`✓ Code converted with ${name}`);

        // Split code from migration notes
        const notesMarker = /\/\*+\s*Migration Notes/i;
        const pyNotesMarker = /#+\s*Migration Notes/i;
        const javaNotesMarker = /\/\/+\s*Migration Notes/i;

        let convertedCode = code;
        let notes = "";
        const markerMatch = code.match(notesMarker) ?? code.match(pyNotesMarker) ?? code.match(javaNotesMarker);
        if (markerMatch?.index !== undefined) {
          convertedCode = code.slice(0, markerMatch.index).trimEnd();
          notes = code.slice(markerMatch.index).trim();
        }

        return NextResponse.json({ code: convertedCode, notes, provider: name });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors[name] = msg;
        console.warn(`✗ ${name} failed: ${msg}`);
      }
    }

    return NextResponse.json(
      { error: "All providers failed", details: errors },
      { status: 500 }
    );
  } catch (err) {
    console.error("Code converter error:", err);
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}
