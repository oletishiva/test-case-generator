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

    // For now, return a simple response to test the deployment
    const response = {
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