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
                maxOutputTokens: config.maxOutputTokens || 20000,
                temperature: config.temperature || 0.0,
            }
        });
    }
    async generateTestCases(requirement) {
        const prompt = `You are a QA expert. Generate exactly 20 comprehensive functional test cases based on the following requirement and acceptance criteria.

REQUIREMENT:
${requirement}

INSTRUCTIONS:
- Generate exactly 20 test cases covering all acceptance criteria mentioned above
- Include positive tests (happy path) and negative tests (error scenarios, edge cases, validations)
- Prioritize based on business impact: Critical for core flows, High for important validations, Medium for edge cases, Low for UI/cosmetic checks
- Each test case must be detailed and specific to the requirement
- Return ONLY a valid JSON array, no markdown, no explanations

REQUIRED JSON FORMAT:
[
  {
    "title": "Test case title describing the scenario",
    "type": "Positive" or "Negative",
    "priority": "Critical" or "High" or "Medium" or "Low",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "expected_result": "Clear expected outcome",
    "test_data": "Test data values or null"
  }
]

Return exactly 20 test cases as a JSON array. Start with [ and end with ]. Do not include any text before or after the JSON array.`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            // Check for candidates first
            const candidates = response.candidates;
            if (!candidates || candidates.length === 0) {
                console.error('Gemini API Response Debug - No candidates:', {
                    response: response,
                    promptFinishReason: response.promptFeedback,
                    safetyRatings: response.candidates?.[0]?.safetyRatings
                });
                throw new Error('No response candidates received from Gemini. This may be due to safety filters or content policy.');
            }
            // Check for finish reason
            const finishReason = candidates[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error('Gemini blocked the response due to safety filters. Please try a different prompt.');
            }
            if (finishReason === 'RECITATION') {
                throw new Error('Gemini blocked the response due to recitation policy. Please rephrase your requirement.');
            }
            let text;
            try {
                text = response.text();
            }
            catch (textError) {
                // If text() fails, try accessing content directly
                const content = candidates[0]?.content;
                if (content?.parts && content.parts.length > 0) {
                    text = content.parts.map((part) => part.text || '').join('');
                }
                else {
                    console.error('Gemini API Response Debug - Cannot extract text:', {
                        candidates,
                        finishReason,
                        textError
                    });
                    throw new Error('No text content in Gemini response. Finish reason: ' + (finishReason || 'UNKNOWN'));
                }
            }
            if (!text || text.trim().length === 0) {
                console.error('Gemini API Response Debug - Empty text:', {
                    candidates,
                    finishReason,
                    textLength: text?.length
                });
                throw new Error('Received empty response from Gemini. Finish reason: ' + (finishReason || 'UNKNOWN'));
            }
            console.log('🔍 Gemini Raw Response Length:', text.length);
            console.log('🔍 Gemini Raw Response Preview:', text.substring(0, 500) + '...');
            console.log('🔍 Gemini Raw Response End:', text.substring(text.length - 200));
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