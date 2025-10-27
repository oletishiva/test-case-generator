const express = require('express');
const cors = require('cors');
const path = require('path');

// Import our routes and services
const { HybridAIService } = require('../dist/services/hybridAIService');
const { TestCaseGenerator } = require('../dist/generators/testCaseGenerator');
const { PlaywrightGenerator } = require('../dist/generators/playwrightGenerator');
const { FileUtils } = require('../dist/utils/fileUtils');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
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
        maxOutputTokens: 4000,
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

  } catch (error) {
    console.error('❌ API Error during generation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown API error occurred'
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export the app for Vercel
module.exports = app;