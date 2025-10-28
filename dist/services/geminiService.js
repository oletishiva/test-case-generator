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

Return ONLY valid JSON array with:
- title: test name (no special characters)
- type: "Positive" or "Negative"  
- priority: "High" or "Medium"
- steps: array of 3-4 steps (escape quotes properly)
- expected_result: outcome (escape quotes properly)
- test_data: test data if needed

IMPORTANT: 
- Use double quotes only
- Escape all quotes in strings with backslash
- No trailing commas
- Valid JSON format only

Example: [{"title":"Test 1","type":"Positive","priority":"High","steps":["step1","step2"],"expected_result":"result1","test_data":"data1"}]`;
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
        const prompt = `Generate SIMPLE Playwright TypeScript code for: "${requirement}"

Requirements:
- Basic locators only (getByRole, getByPlaceholder, getByText)
- Simple functions for common actions
- Basic test structure
- Keep it minimal and fast
- No complex POM patterns

Generate:
1. Page class with locators
2. Basic functions (login, click, fill)
3. Simple test file

Format as single file with separators.`;
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