#!/usr/bin/env node

/**
 * Example usage of the Test Case Generator
 * 
 * This script demonstrates how to use the tool programmatically
 * Make sure to set your OPENAI_API_KEY in the .env file before running
 */

const { TestCaseGeneratorApp } = require('./dist/main');

async function runExample() {
  console.log('🎯 Test Case Generator Example');
  console.log('==============================');
  console.log('');

  // Example requirements
  const examples = [
    "As a user, I should be able to reset my password via email link",
    "As a user, I should be able to login with my email and password",
    "As a user, I should be able to create a new account",
    "As a user, I should be able to view my profile information"
  ];

  for (const requirement of examples) {
    console.log(`📝 Testing requirement: "${requirement}"`);
    console.log('---');
    
    try {
      const app = new TestCaseGeneratorApp();
      await app.generateTestCases(requirement, true);
      console.log('✅ Success!\n');
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

// Run the example
runExample().catch(console.error);
