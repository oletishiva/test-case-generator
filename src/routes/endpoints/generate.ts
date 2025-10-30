import { RouteContext } from '../context';

export function registerGenerate({ router, testCaseGenerator, fileUtils }: RouteContext): void {
  router.post('/generate', async (req, res) => {
    try {
      const { requirement, generatePlaywright = false, openaiKey, geminiKey, primaryService = 'gemini', acceptanceCriteria, testPyramid, prioritizationRules } = req.body;
      if (!requirement || typeof requirement !== 'string') {
        return res.status(400).json({ success: false, error: 'Requirement is required and must be a string' });
      }
      const finalOpenaiKey = openaiKey || process.env.OPENAI_API_KEY;
      const finalGeminiKey = geminiKey || process.env.GEMINI_API_KEY;
      if (!finalOpenaiKey && !finalGeminiKey) {
        return res.status(400).json({ success: false, error: 'At least one API key (OpenAI or Gemini) is required. Please provide API keys or server env vars.' });
      }
      const { HybridAIService } = require('../../services/hybridAIService');
      const { TestCaseGenerator } = require('../../generators/testCaseGenerator');
      const { PlaywrightGenerator } = require('../../generators/playwrightGenerator');

      const aiConfig = {
        primary: primaryService as 'openai' | 'gemini',
        openai: finalOpenaiKey ? { apiKey: finalOpenaiKey, model: 'gpt-4o-mini', maxTokens: 2000 } : undefined,
        gemini: finalGeminiKey ? { apiKey: finalGeminiKey, model: 'gemini-2.5-flash', maxOutputTokens: 20000, temperature: 0.0 } : undefined,
      };
      const clientAIService = new HybridAIService(aiConfig);
      const clientTestCaseGenerator = new TestCaseGenerator(clientAIService);
      const clientPlaywrightGenerator = new PlaywrightGenerator(clientAIService);

      const fullRequirement = acceptanceCriteria ? `${requirement}\n\nAcceptance Criteria:\n${acceptanceCriteria}` : requirement;

      let testCaseResponse: any;
      let playwrightCode: string | undefined;
      if (generatePlaywright) {
        const [testCasesResult, playwrightResult] = await Promise.allSettled([
          clientTestCaseGenerator.generate({ requirement: fullRequirement, generatePlaywright: false }),
          clientPlaywrightGenerator.generatePlaywrightCode(fullRequirement, [])
        ]);
        testCaseResponse = testCasesResult.status === 'fulfilled' ? testCasesResult.value : { testCases: [], success: false };
        playwrightCode = playwrightResult.status === 'fulfilled' ? playwrightResult.value : '';
        if (!testCaseResponse.success) return res.status(500).json(testCaseResponse);
      } else {
        testCaseResponse = await clientTestCaseGenerator.generate({ requirement: fullRequirement, generatePlaywright: false });
        if (!testCaseResponse.success) return res.status(500).json(testCaseResponse);
      }

      const savedFiles = await fileUtils.saveGeneratedTests(testCaseResponse.testCases, playwrightCode || undefined, 'api_generated');
      const prioritized = applyTestPyramid(testCaseResponse.testCases, testPyramid || { unit: 70, integration: 20, e2e: 10 });
      const final = applyPrioritizationRules(prioritized, prioritizationRules || { critical: true, high: true, medium: true, low: true });
      const traceability = generateTraceability(fullRequirement, final);

      return res.json({
        testCases: final,
        playwrightCode,
        testPyramid: testPyramid || { unit: 70, integration: 20, e2e: 10 },
        prioritizedTestCases: final,
        traceabilityMatrix: traceability,
        success: true,
        files: savedFiles,
        metadata: { testCaseCount: final.length, generatedAt: new Date().toISOString(), hasPlaywrightCode: !!playwrightCode }
      });
    } catch (error) {
      console.error('❌ API Error:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
    }
  });

  function applyTestPyramid(testCases: any[], testPyramid: any): any[] {
    const total = testCases.length;
    const unitCount = Math.round((testPyramid.unit / 100) * total);
    const integrationCount = Math.round((testPyramid.integration / 100) * total);
    const e2eCount = total - unitCount - integrationCount;
    let unit = testCases.slice(0, unitCount).map(tc => ({ ...tc, testType: 'Unit' }));
    let integ = testCases.slice(unitCount, unitCount + integrationCount).map(tc => ({ ...tc, testType: 'Integration' }));
    let e2e = testCases.slice(unitCount + integrationCount).map(tc => ({ ...tc, testType: 'E2E' }));
    return [...unit, ...integ, ...e2e];
  }

  function applyPrioritizationRules(testCases: any[], rules: any): any[] {
    return testCases.map(tc => {
      let priority = 'Medium';
      const title = (tc.title || '').toLowerCase();
      if (rules.critical && (title.includes('security') || title.includes('data') || title.includes('critical'))) priority = 'Critical';
      else if (rules.high && (title.includes('login') || title.includes('user') || title.includes('core'))) priority = 'High';
      else if (rules.medium && (title.includes('edge') || title.includes('error') || title.includes('validation'))) priority = 'Medium';
      else if (rules.low && (title.includes('ui') || title.includes('display') || title.includes('cosmetic'))) priority = 'Low';
      return { ...tc, priority };
    });
  }

  function generateTraceability(requirement: string, testCases: any[]): any[] {
    const requirements = requirement.split('\n').filter(line => line.trim().length > 0);
    return requirements.map(req => {
      const key = req.toLowerCase().substring(0, 10);
      const related = testCases.filter(tc => tc.title.toLowerCase().includes(key) || (tc.steps || []).some((s: string) => s.toLowerCase().includes(key)));
      return { requirement: req.substring(0, 100) + (req.length > 100 ? '...' : ''), testCases: related.map(tc => tc.title), coverage: related.length > 0 ? 'Full' : 'Not Covered' };
    });
  }
}


