import OpenAI from 'openai';
import { OpenAIConfig } from '../types';

export class OpenAIService {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async generateTestCases(requirement: string): Promise<string> {
    const prompt = `You are a senior QA Automation Engineer. Convert the below requirement into structured test cases (JSON format).

Requirements:
1. Generate both Positive and Negative test cases
2. Each test case should have: title, type, steps, expected_result
3. Steps should be clear and actionable
4. Expected results should be specific and measurable
5. Return ONLY valid JSON array format

Requirement: "${requirement}"

Return format:
[
  {
    "title": "Test case title",
    "type": "Positive or Negative",
    "steps": ["step1", "step2", "step3"],
    "expected_result": "Expected outcome"
  }
]`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a senior QA Automation Engineer with expertise in test case generation and quality assurance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens || 2000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received from OpenAI');
      }

      return content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePlaywrightCode(requirement: string, testCases: any[]): Promise<string> {
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
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a senior QA Automation Engineer with expertise in Playwright test automation and TypeScript.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens || 3000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received from OpenAI');
      }

      return content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API for Playwright generation:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
