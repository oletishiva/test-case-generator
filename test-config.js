#!/usr/bin/env node

/**
 * Test script to check the hybrid AI configuration
 * This shows which AI services are available and configured
 */

// Load environment variables
require('dotenv').config();

// Import the services directly
const { HybridAIService } = require('./dist/services/hybridAIService');

function testConfiguration() {
  console.log('🎯 Testing Hybrid AI Configuration');
  console.log('==================================');
  console.log('');

  // Check environment variables
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const primary = process.env.AI_PRIMARY_SERVICE || (openaiKey ? 'openai' : 'gemini');

  console.log('🔍 Environment Configuration:');
  console.log(`  OpenAI API Key: ${openaiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Gemini API Key: ${geminiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Primary Service: ${primary}`);
  console.log('');

  if (!openaiKey && !geminiKey) {
    console.log('❌ Error: No API keys configured!');
    console.log('   Please add at least one API key to your .env file:');
    console.log('   - OPENAI_API_KEY=your_key_here');
    console.log('   - GEMINI_API_KEY=your_key_here');
    return;
  }

  try {
    // Build AI service configuration
    const aiConfig = {
      primary: primary,
      openai: openaiKey ? {
        apiKey: openaiKey,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000')
      } : undefined,
      gemini: geminiKey ? {
        apiKey: geminiKey,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '2000'),
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.3')
      } : undefined
    };

    // Initialize hybrid AI service
    const aiService = new HybridAIService(aiConfig);

    // Show available services
    const availableServices = aiService.getAvailableServices();
    const primaryService = aiService.getPrimaryService();

    console.log('🤖 AI Service Status:');
    console.log(`  Available Services: ${availableServices.join(', ')}`);
    console.log(`  Primary Service: ${primaryService}`);
    console.log('');

    if (availableServices.length === 0) {
      console.log('❌ No AI services are properly configured!');
      return;
    }

    console.log('✅ Configuration is valid!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('  1. Add your actual API keys to the .env file');
    console.log('  2. Run: npm run start "your requirement here"');
    console.log('  3. The tool will use the primary service and fallback if needed');

  } catch (error) {
    console.error('❌ Configuration Error:', error.message);
    console.log('');
    console.log('💡 Common issues:');
    console.log('  - Invalid API key format');
    console.log('  - Missing required environment variables');
    console.log('  - Network connectivity issues');
  }
}

// Run the test
testConfiguration();
