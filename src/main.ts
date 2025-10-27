#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { Command } from 'commander';
import express from 'express';
import cors from 'cors';
import { HybridAIService } from './services/hybridAIService';
import { TestCaseGenerator } from './generators/testCaseGenerator';
import { PlaywrightGenerator } from './generators/playwrightGenerator';
import { FileUtils } from './utils/fileUtils';
import { AIRoutes } from './routes/aiRoutes';
import { GenerationRequest, AIServiceConfig } from './types';

// Load environment variables
dotenv.config();

class TestCaseGeneratorApp {
  private aiService: HybridAIService;
  private testCaseGenerator: TestCaseGenerator;
  private playwrightGenerator: PlaywrightGenerator;
  private fileUtils: FileUtils;

  constructor() {
    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!openaiKey && !geminiKey) {
      console.error('❌ Error: At least one API key (OPENAI_API_KEY or GEMINI_API_KEY) is required in .env file');
      process.exit(1);
    }

    // Determine primary service
    const primary = (process.env.AI_PRIMARY_SERVICE as 'openai' | 'gemini') || (openaiKey ? 'openai' : 'gemini');

    // Build AI service configuration
    const aiConfig: AIServiceConfig = {
      primary,
      openai: openaiKey ? {
        apiKey: openaiKey,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000')
      } : undefined,
      gemini: geminiKey ? {
        apiKey: geminiKey,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '4000'),
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.3')
      } : undefined
    };

    // Initialize hybrid AI service
    this.aiService = new HybridAIService(aiConfig);

    // Log available services
    const availableServices = this.aiService.getAvailableServices();
    console.log(`🤖 Available AI services: ${availableServices.join(', ')}`);
    console.log(`🎯 Primary service: ${this.aiService.getPrimaryService()}`);

    this.testCaseGenerator = new TestCaseGenerator(this.aiService);
    this.playwrightGenerator = new PlaywrightGenerator(this.aiService);
    this.fileUtils = new FileUtils();
  }

  async generateTestCases(requirement: string, generatePlaywright: boolean = true): Promise<void> {
    try {
      console.log('🎯 Test Case Generator');
      console.log('====================');
      console.log(`📝 Requirement: "${requirement}"`);
      console.log('');

      const request: GenerationRequest = {
        requirement,
        generatePlaywright
      };

      // Generate test cases
      const testCaseResponse = await this.testCaseGenerator.generate(request);

      if (!testCaseResponse.success) {
        console.error('❌ Failed to generate test cases:', testCaseResponse.error);
        process.exit(1);
      }

      console.log(`✅ Generated ${testCaseResponse.testCases.length} test cases:`);
      testCaseResponse.testCases.forEach((testCase, index) => {
        console.log(`   ${index + 1}. [${testCase.type}] ${testCase.title}`);
      });
      console.log('');

      // Generate Playwright code if requested
      let playwrightCode: string | undefined;
      if (generatePlaywright && testCaseResponse.testCases.length > 0) {
        try {
          playwrightCode = await this.playwrightGenerator.generatePlaywrightCode(
            requirement,
            testCaseResponse.testCases
          );
          console.log('🎭 Generated Playwright test code');
        } catch (error) {
          console.warn('⚠️  Failed to generate Playwright code with AI, using fallback generator');
          playwrightCode = this.playwrightGenerator.generateBasicPlaywrightCode(testCaseResponse.testCases);
        }
      }

      // Save files
      const savedFiles = await this.fileUtils.saveGeneratedTests(
        testCaseResponse.testCases,
        playwrightCode || '',
        'cli_generated'
      );

      console.log('💾 Files saved:');
      console.log(`   📄 Test Cases: ${savedFiles.testCasesPath}`);
      if (playwrightCode) {
        console.log(`   🎭 Playwright: ${savedFiles.playwrightPath}`);
      }

      console.log('');
      console.log('🎉 Generation complete!');

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }

  startAPIServer(port: number = 3000): void {
    const app = express();
    
    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.static('public')); // Serve web interface
    app.use(express.static('output')); // Serve generated files

    // Routes
    const aiRoutes = new AIRoutes(
      this.testCaseGenerator,
      this.playwrightGenerator,
      this.fileUtils
    );
    
    app.use('/api', aiRoutes.getRouter());

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        message: 'Test Case Generator API',
        version: '1.0.0',
        endpoints: {
          health: 'GET /api/health',
          generate: 'POST /api/generate',
          files: 'GET /api/files',
          download: 'GET /api/download/:filename',
          cleanup: 'POST /api/cleanup'
        }
      });
    });

    app.listen(port, () => {
      console.log('🚀 Test Case Generator API Server');
      console.log('================================');
      console.log(`🌐 Server running on http://localhost:${port}`);
      console.log(`📚 API Documentation: http://localhost:${port}/api`);
      console.log(`📁 Generated files: http://localhost:${port}/`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  POST /api/generate - Generate test cases');
      console.log('  GET  /api/files   - List generated files');
      console.log('  GET  /api/health  - Health check');
      console.log('');
      console.log('Press Ctrl+C to stop the server');
    });
  }
}

// CLI Setup
const program = new Command();

program
  .name('test-case-generator')
  .description('AI-powered test case generator using OpenAI API')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate test cases from a requirement')
  .argument('<requirement>', 'The requirement or user story to generate test cases for')
  .option('--no-playwright', 'Skip generating Playwright test code')
  .action(async (requirement: string, options: { playwright: boolean }) => {
    const app = new TestCaseGeneratorApp();
    await app.generateTestCases(requirement, options.playwright);
  });

program
  .command('api')
  .description('Start the API server')
  .option('-p, --port <port>', 'Port number', '3000')
  .action((options: { port: string }) => {
    const app = new TestCaseGeneratorApp();
    app.startAPIServer(parseInt(options.port));
  });

// Handle direct execution with requirement as argument
if (process.argv.length >= 3 && !process.argv[2].startsWith('-') && process.argv[2] !== 'api') {
  const requirement = process.argv.slice(2).join(' ');
  const app = new TestCaseGeneratorApp();
  app.generateTestCases(requirement, true);
} else {
  program.parse();
}

// Export for potential use as module
export { TestCaseGeneratorApp };

// Also make it available as a CommonJS export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestCaseGeneratorApp };
}
