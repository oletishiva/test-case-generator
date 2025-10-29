#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseGeneratorApp = void 0;
const dotenv = __importStar(require("dotenv"));
const commander_1 = require("commander");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const hybridAIService_1 = require("./services/hybridAIService");
const testCaseGenerator_1 = require("./generators/testCaseGenerator");
const playwrightGenerator_1 = require("./generators/playwrightGenerator");
const fileUtils_1 = require("./utils/fileUtils");
const aiRoutes_1 = require("./routes/aiRoutes");
// Load environment variables
dotenv.config();
class TestCaseGeneratorApp {
    constructor() {
        // Check for API keys
        const openaiKey = process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!openaiKey && !geminiKey) {
            console.error('❌ Error: At least one API key (OPENAI_API_KEY or GEMINI_API_KEY) is required in .env file');
            process.exit(1);
        }
        // Determine primary service
        const primary = process.env.AI_PRIMARY_SERVICE || (openaiKey ? 'openai' : 'gemini');
        // Build AI service configuration
        const aiConfig = {
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
        this.aiService = new hybridAIService_1.HybridAIService(aiConfig);
        // Log available services
        const availableServices = this.aiService.getAvailableServices();
        console.log(`🤖 Available AI services: ${availableServices.join(', ')}`);
        console.log(`🎯 Primary service: ${this.aiService.getPrimaryService()}`);
        this.testCaseGenerator = new testCaseGenerator_1.TestCaseGenerator(this.aiService);
        this.playwrightGenerator = new playwrightGenerator_1.PlaywrightGenerator(this.aiService);
        this.fileUtils = new fileUtils_1.FileUtils();
    }
    async generateTestCases(requirement, generatePlaywright = true) {
        try {
            console.log('🎯 Test Case Generator');
            console.log('====================');
            console.log(`📝 Requirement: "${requirement}"`);
            console.log('');
            const request = {
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
            let playwrightCode;
            if (generatePlaywright && testCaseResponse.testCases.length > 0) {
                try {
                    playwrightCode = await this.playwrightGenerator.generatePlaywrightCode(requirement, testCaseResponse.testCases);
                    console.log('🎭 Generated Playwright test code');
                }
                catch (error) {
                    console.warn('⚠️  Failed to generate Playwright code with AI, using fallback generator');
                    playwrightCode = this.playwrightGenerator.generateBasicPlaywrightCode(testCaseResponse.testCases);
                }
            }
            else {
                console.log('🎭 Skipping Playwright code generation (not requested)');
            }
            // Save files
            const savedFiles = await this.fileUtils.saveGeneratedTests(testCaseResponse.testCases, playwrightCode || undefined, 'cli_generated');
            console.log('💾 Files saved:');
            console.log(`   📄 Test Cases: ${savedFiles.testCasesPath}`);
            if (savedFiles.playwrightPath) {
                console.log(`   🎭 Playwright: ${savedFiles.playwrightPath}`);
            }
            console.log('');
            console.log('🎉 Generation complete!');
        }
        catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
    startAPIServer(port = 3000) {
        const app = (0, express_1.default)();
        // Middleware
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        app.use(express_1.default.static('public')); // Serve web interface
        app.use(express_1.default.static('output')); // Serve generated files
        // Routes
        const aiRoutes = new aiRoutes_1.AIRoutes(this.testCaseGenerator, this.playwrightGenerator, this.fileUtils);
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
exports.TestCaseGeneratorApp = TestCaseGeneratorApp;
// CLI Setup
const program = new commander_1.Command();
program
    .name('test-case-generator')
    .description('AI-powered test case generator using OpenAI API')
    .version('1.0.0');
program
    .command('generate')
    .description('Generate test cases from a requirement')
    .argument('<requirement>', 'The requirement or user story to generate test cases for')
    .option('--no-playwright', 'Skip generating Playwright test code')
    .action(async (requirement, options) => {
    const app = new TestCaseGeneratorApp();
    await app.generateTestCases(requirement, options.playwright);
});
program
    .command('api')
    .description('Start the API server')
    .option('-p, --port <port>', 'Port number', '3000')
    .action((options) => {
    const app = new TestCaseGeneratorApp();
    app.startAPIServer(parseInt(options.port));
});
// Handle direct execution with requirement as argument
if (process.argv.length >= 3 && !process.argv[2].startsWith('-') && process.argv[2] !== 'api') {
    const requirement = process.argv.slice(2).join(' ');
    const app = new TestCaseGeneratorApp();
    app.generateTestCases(requirement, true);
}
else {
    program.parse();
}
// Also make it available as a CommonJS export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestCaseGeneratorApp };
}
//# sourceMappingURL=main.js.map