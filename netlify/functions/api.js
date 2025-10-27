const { TestCaseGeneratorApp } = require('../../dist/main');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { 
      requirement, 
      generatePlaywright = true, 
      openaiKey, 
      geminiKey, 
      primaryService = 'gemini',
      acceptanceCriteria 
    } = body;

    if (!requirement) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Requirement is required'
        }),
      };
    }

    if (!openaiKey && !geminiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'At least one API key is required'
        }),
      };
    }

    // Create AI service with client keys
    const { HybridAIService } = require('../../dist/services/hybridAIService');
    const { TestCaseGenerator } = require('../../dist/generators/testCaseGenerator');
    const { PlaywrightGenerator } = require('../../dist/generators/playwrightGenerator');

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

    // Combine requirement with acceptance criteria
    const fullRequirement = acceptanceCriteria 
      ? `${requirement}\n\nAcceptance Criteria:\n${acceptanceCriteria}`
      : requirement;

    // Generate test cases
    const testCaseResponse = await testCaseGenerator.generate({
      requirement: fullRequirement,
      generatePlaywright
    });

    if (!testCaseResponse.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(testCaseResponse),
      };
    }

    // Generate Playwright code if requested
    let playwrightCode;
    if (generatePlaywright && testCaseResponse.testCases.length > 0) {
      try {
        playwrightCode = await playwrightGenerator.generatePlaywrightCode(
          fullRequirement,
          testCaseResponse.testCases
        );
      } catch (error) {
        console.warn('Playwright generation failed, using fallback:', error);
        playwrightCode = playwrightGenerator.generateBasicPlaywrightCode(testCaseResponse.testCases);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        testCases: testCaseResponse.testCases,
        playwrightCode,
        metadata: {
          testCaseCount: testCaseResponse.testCases.length,
          generatedAt: new Date().toISOString(),
          hasPlaywrightCode: !!playwrightCode
        }
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
    };
  }
};
