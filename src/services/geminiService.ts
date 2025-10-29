import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GeminiConfig } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.model = this.genAI.getGenerativeModel({
          model: config.model || 'gemini-2.5-flash',
          generationConfig: {
            maxOutputTokens: config.maxOutputTokens || 20000,
            temperature: config.temperature || 0.0,
          }
        });
  }

  async generateTestCases(requirement: string): Promise<string> {
      const prompt = `Generate 20 test cases for: "${requirement}"

Return JSON array with exactly 20 test cases. Each test case must have:
- title: string
- type: "Positive" or "Negative"
- priority: "Critical", "High", "Medium", or "Low"
- steps: array of strings
- expected_result: string
- test_data: string or null

Format: [{"title":"Test name","type":"Positive","priority":"High","steps":["Step 1","Step 2"],"expected_result":"Result","test_data":"Data"}]

Generate exactly 20 test cases. Return only JSON array.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🔍 Gemini Raw Response Length:', text.length);
      console.log('🔍 Gemini Raw Response Preview:', text.substring(0, 500) + '...');
      console.log('🔍 Gemini Raw Response End:', text.substring(text.length - 200));

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
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePlaywrightCode(requirement: string, testCases: any[]): Promise<string> {
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
      } else if (cleanCode.startsWith('```')) {
        cleanCode = cleanCode.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return cleanCode;
    } catch (error) {
      console.error('Error calling Gemini API for Playwright generation:', error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
