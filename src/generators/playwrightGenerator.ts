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

  // Fallback method to generate basic Playwright code if AI fails
  generateBasicPlaywrightCode(testCases: TestCase[]): string {
    return `// ========================================
// BasePage.ts - Common page methods
// ========================================
import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigateTo(url: string): Promise<void> {
    console.log(\`Navigating to: \${url}\`);
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: \`screenshots/\${name}.png\` });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}

// ========================================
// LoginPage.ts - Login page specific methods
// ========================================
export class LoginPage extends BasePage {
  // Locators
  private get emailInput() { return this.page.getByPlaceholder('Email'); }
  private get passwordInput() { return this.page.getByPlaceholder('Password'); }
  private get loginButton() { return this.page.getByRole('button', { name: 'Login' }); }
  private get errorMessage() { return this.page.getByText('Invalid email or password'); }
  private get successMessage() { return this.page.getByText('Login successful'); }

  // Methods
  async login(email: string, password: string): Promise<void> {
    console.log(\`Logging in with: \${email}\`);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }
}

// ========================================
// login.spec.ts - Test file
// ========================================
import { test, expect } from '@playwright/test';
import { LoginPage } from './LoginPage';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo('http://localhost:3000/login');
  });

${testCases.map((testCase, index) => {
  const testName = testCase.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  return `  test('${testCase.title}', async ({ page }) => {
    console.log('Running: ${testCase.title}');
    console.log('Type: ${testCase.type}');
    console.log('Priority: ${testCase.priority}');
    
    // Test steps:
${testCase.steps.map(step => `    // ${step}`).join('\n')}
    
    // Expected result: ${testCase.expected_result}
    
    // TODO: Implement specific test logic based on test case
    if ('${testCase.type}' === 'Positive') {
      // Positive test implementation
      await loginPage.login('test@example.com', 'password123');
      await expect(loginPage.isSuccessMessageVisible()).toBeTruthy();
    } else {
      // Negative test implementation  
      await loginPage.login('invalid@example.com', 'wrongpassword');
      await expect(loginPage.isErrorMessageVisible()).toBeTruthy();
    }
  });`;
}).join('\n\n')}
});`;
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
