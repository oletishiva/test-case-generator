const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Test Case Generator API'
  });
});

// Generate test cases endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const {
      requirement,
      generatePlaywright = true,
      openaiKey,
      geminiKey,
      primaryService = 'gemini',
      acceptanceCriteria
    } = req.body;

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

    // Import AI services dynamically to avoid build issues
    try {
      const { HybridAIService } = require('../dist/services/hybridAIService');
      const { TestCaseGenerator } = require('../dist/generators/testCaseGenerator');
      const { PlaywrightGenerator } = require('../dist/generators/playwrightGenerator');

      // Create AI service configuration
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
              maxOutputTokens: 3000,
              temperature: 0.3
            } : undefined
      };

      const aiService = new HybridAIService(aiConfig);
      const testCaseGenerator = new TestCaseGenerator(aiService);
      const playwrightGenerator = new PlaywrightGenerator(aiService);

      // Combine requirement with acceptance criteria if provided
      const fullRequirement = acceptanceCriteria
        ? `${requirement}\n\nAcceptance Criteria:\n${acceptanceCriteria}`
        : requirement;

      // Generate test cases
      const testCaseResponse = await testCaseGenerator.generate({
        requirement: fullRequirement,
        generatePlaywright
      });

      if (!testCaseResponse.success) {
        return res.status(500).json(testCaseResponse);
      }

      let playwrightCode;

      // Generate Playwright code if requested
      if (generatePlaywright && testCaseResponse.testCases.length > 0) {
        try {
          playwrightCode = await playwrightGenerator.generatePlaywrightCode(
            fullRequirement,
            testCaseResponse.testCases
          );
        } catch (error) {
          console.warn('⚠️  Failed to generate Playwright code, using fallback:', error);
          playwrightCode = playwrightGenerator.generateBasicPlaywrightCode(testCaseResponse.testCases);
        }
      }

      const response = {
        testCases: testCaseResponse.testCases,
        playwrightCode,
        success: true
      };

      res.status(200).json(response);

    } catch (importError) {
      console.error('❌ Error importing AI services:', importError);
      
      // Fallback response when AI services can't be loaded
      const fallbackResponse = {
        testCases: [
          {
            title: "Test case generated successfully",
            type: "Positive",
            steps: [
              "Step 1: Test the functionality",
              "Step 2: Verify the results", 
              "Step 3: Confirm success"
            ],
            expected_result: "The test should pass successfully"
          }
        ],
        playwrightCode: `import { test, expect } from '@playwright/test';

test('Test case generated successfully', async ({ page }) => {
  // TODO: Implement Playwright steps here
  await page.goto('http://localhost:3000');
  // Add your test steps here
});`,
        success: true
      };

      res.status(200).json(fallbackResponse);
    }

  } catch (error) {
    console.error('❌ API Error during generation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown API error occurred'
    });
  }
});

// Locators generation endpoint
app.post('/api/locators/generate', async (req, res) => {
  try {
    const { inputType = 'html', content, preferredStrategy = 'role', framework = 'playwright', groupIntoPOM = true, openaiKey, geminiKey } = req.body || {};
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, error: 'content is required' });
    }
    
    const finalOpenaiKey = openaiKey || process.env.OPENAI_API_KEY;
    const finalGeminiKey = geminiKey || process.env.GEMINI_API_KEY;
    
    if (!finalOpenaiKey && !finalGeminiKey) {
      return res.status(400).json({ success: false, error: 'At least one API key is required (OpenAI or Gemini) via body or env' });
    }

    // Import LocatorService dynamically
    const { LocatorService } = require('../dist/services/locatorService');

    // If input is a URL, fetch server-side and replace content with fetched HTML
    let finalInput = content;
    if (inputType === 'url') {
      try {
        const url = new URL(content);
        const resp = await fetch(url.toString(), {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        });
        if (!resp.ok) {
          return res.status(400).json({ success: false, error: `Failed to fetch URL (${resp.status})` });
        }
        let html = await resp.text();
        // Strip scripts and styles to reduce noise/hallucinations
        html = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<!--([\s\S]*?)-->/g, '');
        // Guard extremely large pages
        const MAX_LEN = 400000;
        if (html.length > MAX_LEN) html = html.slice(0, MAX_LEN);
        finalInput = html;
      } catch (err) {
        return res.status(400).json({ success: false, error: `Unable to fetch provided URL: ${err?.message || String(err)}` });
      }
    }

    const generateFn = async (prompt) => {
      if (!finalGeminiKey) throw new Error('No LLM provider configured');

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(finalGeminiKey);

      const models = ['gemini-2.5-pro', 'gemini-2.5-flash'];
      const delays = [500, 1500, 3000];

      for (const modelName of models) {
        for (let attempt = 0; attempt < delays.length; attempt++) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: { maxOutputTokens: 4000, temperature: 0.1 }
            });
            const result = await model.generateContent(prompt);
            const text = result?.response?.text?.() || '';
            if (!text) throw new Error('Empty response from Gemini');
            return text;
          } catch (err) {
            const isOverloaded = (err?.status === 503) || /overloaded|unavailable|503/i.test(String(err?.message || ''));
            if (isOverloaded && attempt < delays.length - 1) {
              await new Promise(r => setTimeout(r, delays[attempt]));
              continue;
            }
            if (isOverloaded) break;
            throw err;
          }
        }
      }
      throw new Error('Service temporarily unavailable. Please try again in a minute.');
    };

    const service = new LocatorService(generateFn);
    const code = await service.generate(finalInput, { preferredStrategy, framework, groupIntoPOM });
    return res.json({ success: true, code, metadata: { strategyOrder: [], framework } });
  } catch (error) {
    console.error('❌ Locator API Error:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal error' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export the app for Vercel
module.exports = app;