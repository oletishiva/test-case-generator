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
        const prompt = `Generate test cases for: "${requirement}"

Return JSON array with 2-3 test cases max. Each test case needs:
- title: brief description
- type: "Positive" or "Negative"  
- steps: array of 3-4 short steps
- expected_result: brief outcome

Format:
[{"title":"Test 1","type":"Positive","steps":["step1","step2"],"expected_result":"result1"},{"title":"Test 2","type":"Negative","steps":["step1","step2"],"expected_result":"result2"}]`;
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
        const prompt = `You are a senior QA Automation Engineer. Generate Playwright TypeScript test code using @playwright/test for the given requirement and test cases.

Requirements:
1. Use @playwright/test framework
2. Generate individual test functions for each test case
3. Use modern Playwright selectors (getByText, getByRole, etc.)
4. Include proper assertions with expect()
5. Use realistic selectors and interactions
6. Add proper test descriptions
7. Handle both positive and negative test cases

Requirement: "${requirement}"

Test Cases: ${JSON.stringify(testCases, null, 2)}

Generate complete Playwright test file with imports and all test functions.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (!text) {
                throw new Error('No response content received from Gemini');
            }
            return text.trim();
        }
        catch (error) {
            console.error('Error calling Gemini API for Playwright generation:', error);
            throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.GeminiService = GeminiService;
//# sourceMappingURL=geminiService.js.map