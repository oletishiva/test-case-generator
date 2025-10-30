import { Router, Request, Response } from 'express';
import { TestCaseGenerator } from '../generators/testCaseGenerator';
import { PlaywrightGenerator } from '../generators/playwrightGenerator';
import { FileUtils } from '../utils/fileUtils';
import { GenerationRequest, GenerationResponse } from '../types';
import { RouteContext } from './context';
import { registerHealth } from './endpoints/health';
import { registerJira } from './endpoints/jira';
import { registerGenerate } from './endpoints/generate';
import { registerLocators } from './endpoints/locators';
import { registerFiles } from './endpoints/files';
import { registerDownload } from './endpoints/download';
import { registerCleanup } from './endpoints/cleanup';

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
    const ctx: RouteContext = {
      router: this.router,
      testCaseGenerator: this.testCaseGenerator,
      playwrightGenerator: this.playwrightGenerator,
      fileUtils: this.fileUtils,
    };
    registerHealth(ctx);
    registerJira(ctx);
    registerGenerate(ctx);
    registerLocators(ctx);
    registerFiles(ctx);
    registerDownload(ctx);
    registerCleanup(ctx);
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
