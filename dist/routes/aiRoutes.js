"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRoutes = void 0;
const express_1 = require("express");
class AIRoutes {
    constructor(testCaseGenerator, playwrightGenerator, fileUtils) {
        this.router = (0, express_1.Router)();
        this.testCaseGenerator = testCaseGenerator;
        this.playwrightGenerator = playwrightGenerator;
        this.fileUtils = fileUtils;
        this.setupRoutes();
    }
    setupRoutes() {
        // Health check endpoint
        this.router.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'Test Case Generator API'
            });
        });
        // Generate test cases endpoint
        this.router.post('/generate', async (req, res) => {
            try {
                const { requirement, generatePlaywright = true, openaiKey, geminiKey, primaryService = 'gemini', acceptanceCriteria } = req.body;
                if (!requirement || typeof requirement !== 'string') {
                    return res.status(400).json({
                        success: false,
                        error: 'Requirement is required and must be a string'
                    });
                }
                if (!openaiKey && !geminiKey) {
                    return res.status(400).json({
                        success: false,
                        error: 'At least one API key (OpenAI or Gemini) is required'
                    });
                }
                console.log(`🚀 API Request - Generating test cases for: "${requirement}"`);
                // Create a new AI service instance with client-provided keys
                const { HybridAIService } = require('../services/hybridAIService');
                const { TestCaseGenerator } = require('../generators/testCaseGenerator');
                const { PlaywrightGenerator } = require('../generators/playwrightGenerator');
                const aiConfig = {
                    primary: primaryService,
                    openai: openaiKey ? {
                        apiKey: openaiKey,
                        model: 'gpt-4o-mini',
                        maxTokens: 2000
                    } : undefined,
                    gemini: geminiKey ? {
                        apiKey: geminiKey,
                        model: 'gemini-2.5-flash',
                        maxOutputTokens: 4000,
                        temperature: 0.3
                    } : undefined
                };
                const clientAIService = new HybridAIService(aiConfig);
                const clientTestCaseGenerator = new TestCaseGenerator(clientAIService);
                const clientPlaywrightGenerator = new PlaywrightGenerator(clientAIService);
                // Combine requirement with acceptance criteria if provided
                const fullRequirement = acceptanceCriteria
                    ? `${requirement}\n\nAcceptance Criteria:\n${acceptanceCriteria}`
                    : requirement;
                let testCaseResponse;
                let playwrightCode;
                if (generatePlaywright) {
                    // Use parallel processing for better performance
                    console.log('🚀 Using parallel processing for test cases and Playwright code...');
                    const [testCasesResult, playwrightResult] = await Promise.allSettled([
                        clientTestCaseGenerator.generate({
                            requirement: fullRequirement,
                            generatePlaywright: false
                        }),
                        clientPlaywrightGenerator.generatePlaywrightCode(fullRequirement, [])
                    ]);
                    testCaseResponse = testCasesResult.status === 'fulfilled' ? testCasesResult.value : { testCases: [], success: false };
                    playwrightCode = playwrightResult.status === 'fulfilled' ? playwrightResult.value : '';
                    if (!testCaseResponse.success) {
                        return res.status(500).json(testCaseResponse);
                    }
                }
                else {
                    // Generate only test cases
                    testCaseResponse = await clientTestCaseGenerator.generate({
                        requirement: fullRequirement,
                        generatePlaywright: false
                    });
                    if (!testCaseResponse.success) {
                        return res.status(500).json(testCaseResponse);
                    }
                }
                // Save files
                const savedFiles = await this.fileUtils.saveGeneratedTests(testCaseResponse.testCases, playwrightCode || '', 'api_generated');
                const response = {
                    testCases: testCaseResponse.testCases,
                    playwrightCode,
                    success: true
                };
                res.json({
                    ...response,
                    files: savedFiles,
                    metadata: {
                        testCaseCount: testCaseResponse.testCases.length,
                        generatedAt: new Date().toISOString(),
                        hasPlaywrightCode: !!playwrightCode
                    }
                });
            }
            catch (error) {
                console.error('❌ API Error:', error);
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Internal server error'
                });
            }
        });
        // Get generated files endpoint
        this.router.get('/files', (req, res) => {
            try {
                const files = this.fileUtils.listGeneratedFiles();
                res.json({
                    success: true,
                    files: files.map(file => ({
                        name: file,
                        path: `/output/${file}`,
                        type: file.endsWith('.json') ? 'test-cases' : 'playwright'
                    }))
                });
            }
            catch (error) {
                console.error('❌ Error listing files:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to list files'
                });
            }
        });
        // Download specific file endpoint
        this.router.get('/download/:filename', async (req, res) => {
            try {
                const { filename } = req.params;
                const filePath = `${this.fileUtils.getOutputDirectory()}/${filename}`;
                const exists = await this.fileUtils.fileExists(filePath);
                if (!exists) {
                    return res.status(404).json({
                        success: false,
                        error: 'File not found'
                    });
                }
                const content = await this.fileUtils.readFile(filePath);
                const contentType = filename.endsWith('.json') ? 'application/json' : 'text/typescript';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(content);
            }
            catch (error) {
                console.error('❌ Error downloading file:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to download file'
                });
            }
        });
        // Cleanup old files endpoint
        this.router.post('/cleanup', async (req, res) => {
            try {
                const { maxAgeHours = 24 } = req.body;
                await this.fileUtils.cleanupOldFiles(maxAgeHours);
                res.json({
                    success: true,
                    message: `Cleaned up files older than ${maxAgeHours} hours`
                });
            }
            catch (error) {
                console.error('❌ Error cleaning up files:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to cleanup files'
                });
            }
        });
    }
    getRouter() {
        return this.router;
    }
}
exports.AIRoutes = AIRoutes;
//# sourceMappingURL=aiRoutes.js.map