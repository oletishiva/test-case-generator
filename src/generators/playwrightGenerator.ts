import { HybridAIService } from '../services/hybridAIService';
import { TestCase } from '../types';

export class PlaywrightGenerator {
  private aiService: HybridAIService;

  constructor(aiService: HybridAIService) {
    this.aiService = aiService;
  }

  async generatePlaywrightCode(requirement: string, testCases: TestCase[]): Promise<string> {
    try {
      console.log('🎭 Generating Playwright test code...');
      
      const playwrightCode = await this.aiService.generatePlaywrightCode(requirement, testCases);
      
      console.log('✅ Generated Playwright test code');
      
      return playwrightCode;
    } catch (error) {
      console.error('❌ Error generating Playwright code:', error);
      throw new Error(`Failed to generate Playwright code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fallback method to generate basic Playwright code if OpenAI fails
  generateBasicPlaywrightCode(testCases: TestCase[]): string {
    const imports = `import { test, expect } from '@playwright/test';\n\n`;
    
    const testFunctions = testCases.map((testCase, index) => {
      const functionName = this.sanitizeFunctionName(testCase.title);
      const steps = testCase.steps.map((step, stepIndex) => {
        // Convert step to basic Playwright actions
        if (step.toLowerCase().includes('navigate') || step.toLowerCase().includes('go to')) {
          return `  await page.goto('https://app.example.com');`;
        } else if (step.toLowerCase().includes('click')) {
          return `  await page.getByText('${this.extractClickTarget(step)}').click();`;
        } else if (step.toLowerCase().includes('fill') || step.toLowerCase().includes('enter')) {
          return `  await page.getByPlaceholder('${this.extractInputTarget(step)}').fill('test@example.com');`;
        } else if (step.toLowerCase().includes('check') || step.toLowerCase().includes('verify')) {
          return `  await expect(page.getByText('${this.extractExpectedText(step)}')).toBeVisible();`;
        } else {
          return `  // ${step}`;
        }
      }).join('\n');

      const assertion = testCase.type === 'Positive' 
        ? `  await expect(page.getByText('${this.extractExpectedText(testCase.expected_result)}')).toBeVisible();`
        : `  await expect(page.getByText('${this.extractExpectedText(testCase.expected_result)}')).toBeVisible();`;

      return `test('${testCase.title}', async ({ page }) => {
${steps}
${assertion}
});`;
    }).join('\n\n');

    return imports + testFunctions;
  }

  private sanitizeFunctionName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  private extractClickTarget(step: string): string {
    // Simple extraction - look for quoted text or common UI elements
    const quotedMatch = step.match(/'([^']+)'|"([^"]+)"/);
    if (quotedMatch) {
      return quotedMatch[1] || quotedMatch[2];
    }
    
    if (step.toLowerCase().includes('button')) return 'Submit';
    if (step.toLowerCase().includes('link')) return 'Click here';
    if (step.toLowerCase().includes('forgot')) return 'Forgot password?';
    
    return 'Click me';
  }

  private extractInputTarget(step: string): string {
    if (step.toLowerCase().includes('email')) return 'Email';
    if (step.toLowerCase().includes('password')) return 'Password';
    if (step.toLowerCase().includes('username')) return 'Username';
    
    return 'Input field';
  }

  private extractExpectedText(text: string): string {
    // Extract the main expected outcome
    const quotedMatch = text.match(/'([^']+)'|"([^"]+)"/);
    if (quotedMatch) {
      return quotedMatch[1] || quotedMatch[2];
    }
    
    // Common expected results
    if (text.toLowerCase().includes('success')) return 'Success';
    if (text.toLowerCase().includes('error')) return 'Error';
    if (text.toLowerCase().includes('visible')) return 'Element visible';
    if (text.toLowerCase().includes('login')) return 'Login successful';
    
    return 'Expected result';
  }
}
