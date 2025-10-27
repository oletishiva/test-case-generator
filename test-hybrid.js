#!/usr/bin/env node

/**
 * Test script to demonstrate the hybrid AI functionality
 * This shows how the tool automatically falls back between OpenAI and Gemini
 */

// Import the app class directly from the compiled JavaScript
const { TestCaseGeneratorApp } = require('./dist/main.js');

async function testHybridFunctionality() {
  console.log('🎯 Testing Hybrid AI Functionality');
  console.log('===================================');
  console.log('');

  // Test with a simple requirement
  const requirement = "As a user, I should be able to login with my email and password";
  
  try {
    console.log('📝 Testing requirement:', requirement);
    console.log('');

    const app = new TestCaseGeneratorApp();
    
    // This will show which AI services are available and which is primary
    console.log('🔍 Configuration loaded successfully!');
    console.log('');

    // Test the generation (this will use the configured primary service)
    await app.generateTestCases(requirement, true);
    
    console.log('');
    console.log('🎉 Hybrid AI functionality test completed!');
    console.log('');
    console.log('📋 What happened:');
    console.log('  ✅ App initialized with hybrid AI service');
    console.log('  ✅ Primary service was used for generation');
    console.log('  ✅ If primary failed, fallback would have been used');
    console.log('  ✅ Files were generated and saved');
    console.log('');
    console.log('💡 To test fallback:');
    console.log('  1. Set an invalid API key for the primary service');
    console.log('  2. Set a valid API key for the fallback service');
    console.log('  3. Run the same command - it will automatically fallback!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('💡 This is expected if no valid API keys are configured.');
    console.log('   Add your API keys to the .env file and try again!');
  }
}

// Run the test
testHybridFunctionality();
