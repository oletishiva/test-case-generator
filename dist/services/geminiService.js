"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiService {
    constructor(config) {
        this.config = config;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(config.apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: config.model || 'gemini-2.5-flash',
            generationConfig: {
                maxOutputTokens: config.maxOutputTokens || 4000,
                temperature: config.temperature || 0.3,
            }
        });
    }
    async generateTestCases(requirement) {
        const prompt = `Generate 6-8 test cases for: "${requirement}"

Return JSON array with:
- title: test name
- type: "Positive" or "Negative"  
- priority: "High" or "Medium"
- steps: array of 3-4 steps
- expected_result: outcome
- test_data: test data if needed

Format: [{"title":"Test 1","type":"Positive","priority":"High","steps":["step1","step2"],"expected_result":"result1","test_data":"data1"}]`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (!text) {
                console.error('Gemini API Response Debug:', {
                    result: result,
                    response: response,
                    text: text,
                    candidates: result.response.candidates
                });
                throw new Error('No response content received from Gemini');
            }
            return text.trim();
        }
        catch (error) {
            console.error('Error calling Gemini API:', error);
            console.error('Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generatePlaywrightCode(requirement, testCases) {
        const testCasesString = JSON.stringify(testCases, null, 2);
        const prompt = `You are a Playwright automation architect. Generate minimal, maintainable Playwright TypeScript code using the Page Object Model (POM) pattern.

Requirement: "${requirement}"

Test Cases (JSON):
${testCasesString}

✅ Requirements:
- Use TypeScript + Playwright test runner
- Create BasePage class with common methods (navigateTo, takeScreenshot, waitForPageLoad)
- Create specific page class extending BasePage with locators and methods
- Generate test file using Playwright's \`test\` that creates page objects and runs tests
- Use \`getByRole\`, \`getByPlaceholder\`, \`getByText\` locators
- Include minimal console logs
- Keep classes short (~100 lines max)
- Clean and readable code

Generate 3 files with clear separators:
1. BasePage.ts - Common page methods
2. [Feature]Page.ts - Specific page with locators  
3. [feature].spec.ts - Test file

Format as single file with clear separators between files.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (!text) {
                throw new Error('No response content received from Gemini');
            }
            // Remove markdown code block if present
            let cleanCode = text.trim();
            if (cleanCode.startsWith('```typescript')) {
                cleanCode = cleanCode.replace(/^```typescript\s*/, '').replace(/\s*```$/, '');
            }
            else if (cleanCode.startsWith('```')) {
                cleanCode = cleanCode.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            return cleanCode;
        }
        catch (error) {
            console.error('Error calling Gemini API for Playwright generation:', error);
            throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.GeminiService = GeminiService;
//# sourceMappingURL=geminiService.js.map