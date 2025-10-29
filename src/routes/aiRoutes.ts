import { Router, Request, Response } from 'express';
import { TestCaseGenerator } from '../generators/testCaseGenerator';
import { PlaywrightGenerator } from '../generators/playwrightGenerator';
import { FileUtils } from '../utils/fileUtils';
import { GenerationRequest, GenerationResponse } from '../types';

export class AIRoutes {
  private router: Router;
  private testCaseGenerator: TestCaseGenerator;
  private playwrightGenerator: PlaywrightGenerator;
  private fileUtils: FileUtils;

  constructor(
    testCaseGenerator: TestCaseGenerator,
    playwrightGenerator: PlaywrightGenerator,
    fileUtils: FileUtils
  ) {
    this.router = Router();
    this.testCaseGenerator = testCaseGenerator;
    this.playwrightGenerator = playwrightGenerator;
    this.fileUtils = fileUtils;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.router.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Test Case Generator API'
      });
    });

    // JIRA integration endpoint
    this.router.post('/jira/fetch', async (req: Request, res: Response) => {
      try {
        const { storyId } = req.body;

        if (!storyId || typeof storyId !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'JIRA Story ID is required'
          });
        }

        console.log(`🔍 Fetching JIRA story: ${storyId}`);

        // For now, we'll simulate JIRA data
        // In a real implementation, you'd integrate with JIRA API
        const mockJiraStory = {
          id: storyId,
          title: `Sample JIRA Story: ${storyId}`,
          status: 'In Progress',
          priority: 'High',
          description: 'This is a sample JIRA story description that would normally be fetched from the JIRA API.',
          acceptanceCriteria: `Given a user wants to ${storyId.toLowerCase().replace('-', ' ')}\nWhen they perform the action\nThen they should see the expected result\n\nAdditional criteria:\n- The system should handle errors gracefully\n- Performance should be under 2 seconds\n- The UI should be responsive`
        };

        res.status(200).json({
          success: true,
          story: mockJiraStory
        });

      } catch (error) {
        console.error('❌ Error fetching JIRA story:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch JIRA story'
        });
      }
    });

    // Generate test cases endpoint
    this.router.post('/generate', async (req: Request, res: Response) => {
      try {
            const { 
              requirement, 
              generatePlaywright = false, 
              openaiKey, 
              geminiKey, 
              primaryService = 'gemini',
              acceptanceCriteria,
              testPyramid,
              prioritizationRules,
              jiraStoryId
            } = req.body;

        if (!requirement || typeof requirement !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Requirement is required and must be a string'
          });
        }

            // Use environment variables as fallback if no API keys provided
            const finalOpenaiKey = openaiKey || process.env.OPENAI_API_KEY;
            const finalGeminiKey = geminiKey || process.env.GEMINI_API_KEY;
            
            if (!finalOpenaiKey && !finalGeminiKey) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one API key (OpenAI or Gemini) is required. Please provide API keys or configure server environment variables.'
                });
            }

        console.log(`🚀 API Request - Generating test cases for: "${requirement}"`);

        // Create a new AI service instance with client-provided keys
        const { HybridAIService } = require('../services/hybridAIService');
        const { TestCaseGenerator } = require('../generators/testCaseGenerator');
        const { PlaywrightGenerator } = require('../generators/playwrightGenerator');

            const aiConfig = {
              primary: primaryService as 'openai' | 'gemini',
              openai: finalOpenaiKey ? {
                apiKey: finalOpenaiKey,
                model: 'gpt-4o-mini',
                maxTokens: 2000
              } : undefined,
              gemini: finalGeminiKey ? {
                apiKey: finalGeminiKey,
                model: 'gemini-2.5-flash',
                maxOutputTokens: 20000,
                temperature: 0.0
              } : undefined
            };

        const clientAIService = new HybridAIService(aiConfig);
        const clientTestCaseGenerator = new TestCaseGenerator(clientAIService);
        const clientPlaywrightGenerator = new PlaywrightGenerator(clientAIService);

        // Combine requirement with acceptance criteria if provided
        const fullRequirement = acceptanceCriteria 
          ? `${requirement}\n\nAcceptance Criteria:\n${acceptanceCriteria}`
          : requirement;

            let testCaseResponse: any;
            let playwrightCode: string | undefined;

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
            } else {
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
        const savedFiles = await this.fileUtils.saveGeneratedTests(
          testCaseResponse.testCases,
          playwrightCode || undefined,
          'api_generated'
        );

        // Apply test pyramid distribution
        const prioritizedTestCases = this.applyTestPyramid(
          testCaseResponse.testCases,
          testPyramid || { unit: 70, integration: 20, e2e: 10 }
        );

        // Apply prioritization rules
        const finalTestCases = this.applyPrioritizationRules(
          prioritizedTestCases,
          prioritizationRules || { critical: true, high: true, medium: true, low: true }
        );

        // Generate traceability matrix
        const traceabilityMatrix = this.generateTraceabilityMatrix(
          fullRequirement,
          finalTestCases
        );

        const response: GenerationResponse = {
          testCases: finalTestCases,
          playwrightCode,
          testPyramid: testPyramid || { unit: 70, integration: 20, e2e: 10 },
          prioritizedTestCases: finalTestCases,
          traceabilityMatrix,
          success: true
        };

        res.json({
          ...response,
          files: savedFiles,
          metadata: {
            testCaseCount: finalTestCases.length,
            generatedAt: new Date().toISOString(),
            hasPlaywrightCode: !!playwrightCode
          }
        });

      } catch (error) {
        console.error('❌ API Error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    });

    // Get generated files endpoint
    this.router.get('/files', (req: Request, res: Response) => {
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
      } catch (error) {
        console.error('❌ Error listing files:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to list files'
        });
      }
    });

    // Download specific file endpoint
    this.router.get('/download/:filename', async (req: Request, res: Response) => {
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

      } catch (error) {
        console.error('❌ Error downloading file:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to download file'
        });
      }
    });

    // Cleanup old files endpoint
    this.router.post('/cleanup', async (req: Request, res: Response) => {
      try {
        const { maxAgeHours = 24 } = req.body;
        await this.fileUtils.cleanupOldFiles(maxAgeHours);
        
        res.json({
          success: true,
          message: `Cleaned up files older than ${maxAgeHours} hours`
        });
      } catch (error) {
        console.error('❌ Error cleaning up files:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to cleanup files'
        });
      }
    });
  }

  getRouter(): Router {
    return this.router;
  }

  private applyTestPyramid(testCases: any[], testPyramid: any): any[] {
    const total = testCases.length;
    const unitCount = Math.round((testPyramid.unit / 100) * total);
    const integrationCount = Math.round((testPyramid.integration / 100) * total);
    const e2eCount = total - unitCount - integrationCount;

    let unitTests = testCases.slice(0, unitCount);
    let integrationTests = testCases.slice(unitCount, unitCount + integrationCount);
    let e2eTests = testCases.slice(unitCount + integrationCount);

    // Add test type information
    unitTests = unitTests.map(tc => ({ ...tc, testType: 'Unit' }));
    integrationTests = integrationTests.map(tc => ({ ...tc, testType: 'Integration' }));
    e2eTests = e2eTests.map(tc => ({ ...tc, testType: 'E2E' }));

    return [...unitTests, ...integrationTests, ...e2eTests];
  }

  private applyPrioritizationRules(testCases: any[], rules: any): any[] {
    return testCases.map(tc => {
      let priority = 'Medium'; // Default priority

      // Apply prioritization rules
      if (rules.critical && (tc.title.toLowerCase().includes('security') || 
        tc.title.toLowerCase().includes('data') || 
        tc.title.toLowerCase().includes('critical'))) {
        priority = 'Critical';
      } else if (rules.high && (tc.title.toLowerCase().includes('login') || 
        tc.title.toLowerCase().includes('user') || 
        tc.title.toLowerCase().includes('core'))) {
        priority = 'High';
      } else if (rules.medium && (tc.title.toLowerCase().includes('edge') || 
        tc.title.toLowerCase().includes('error') || 
        tc.title.toLowerCase().includes('validation'))) {
        priority = 'Medium';
      } else if (rules.low && (tc.title.toLowerCase().includes('ui') || 
        tc.title.toLowerCase().includes('display') || 
        tc.title.toLowerCase().includes('cosmetic'))) {
        priority = 'Low';
      }

      return { ...tc, priority };
    });
  }

  private generateTraceabilityMatrix(requirement: string, testCases: any[]): any[] {
    // Simple traceability matrix generation
    // In a real implementation, this would be more sophisticated
    const requirements = requirement.split('\n').filter(line => line.trim().length > 0);
    
    return requirements.map((req, index) => {
      const relatedTestCases = testCases.filter(tc => 
        tc.title.toLowerCase().includes(req.toLowerCase().substring(0, 10)) ||
        tc.steps.some((step: string) => step.toLowerCase().includes(req.toLowerCase().substring(0, 10)))
      );

      return {
        requirement: req.substring(0, 100) + (req.length > 100 ? '...' : ''),
        testCases: relatedTestCases.map(tc => tc.title),
        coverage: relatedTestCases.length > 0 ? 'Full' : 'Not Covered'
      };
    });
  }
}
