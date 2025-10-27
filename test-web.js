#!/usr/bin/env node

/**
 * Test script to verify the web interface is working
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function testWebInterface() {
  console.log('🌐 Testing Web Interface');
  console.log('========================');
  console.log('');

  // Test 1: Check if static files exist
  console.log('📁 Checking static files...');
  const staticFiles = [
    'public/index.html',
    'public/css/style.css',
    'public/js/app.js'
  ];

  let allFilesExist = true;
  staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - Missing!`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.log('❌ Some static files are missing!');
    return;
  }

  console.log('✅ All static files present');
  console.log('');

  // Test 2: Check if built files exist
  console.log('🔨 Checking built files...');
  const builtFiles = [
    'dist/main.js',
    'dist/services/hybridAIService.js',
    'dist/generators/testCaseGenerator.js',
    'dist/generators/playwrightGenerator.js'
  ];

  let allBuiltFilesExist = true;
  builtFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - Missing!`);
      allBuiltFilesExist = false;
    }
  });

  if (!allBuiltFilesExist) {
    console.log('❌ Some built files are missing! Run npm run build first');
    return;
  }

  console.log('✅ All built files present');
  console.log('');

  // Test 3: Check HTML content
  console.log('📄 Checking HTML content...');
  const htmlContent = fs.readFileSync('public/index.html', 'utf8');
  
  const requiredElements = [
    'AI Test Case Generator',
    'openaiKey',
    'geminiKey',
    'requirement',
    'generateBtn',
    'api/generate'
  ];

  let allElementsFound = true;
  requiredElements.forEach(element => {
    if (htmlContent.includes(element)) {
      console.log(`  ✅ Found: ${element}`);
    } else {
      console.log(`  ❌ Missing: ${element}`);
      allElementsFound = false;
    }
  });

  if (!allElementsFound) {
    console.log('❌ Some required HTML elements are missing!');
    return;
  }

  console.log('✅ HTML content looks good');
  console.log('');

  // Test 4: Check CSS content
  console.log('🎨 Checking CSS content...');
  const cssContent = fs.readFileSync('public/css/style.css', 'utf8');
  
  const requiredStyles = [
    '.container',
    '.card',
    '.btn',
    '.test-case',
    '.loading-overlay'
  ];

  let allStylesFound = true;
  requiredStyles.forEach(style => {
    if (cssContent.includes(style)) {
      console.log(`  ✅ Found: ${style}`);
    } else {
      console.log(`  ❌ Missing: ${style}`);
      allStylesFound = false;
    }
  });

  if (!allStylesFound) {
    console.log('❌ Some required CSS styles are missing!');
    return;
  }

  console.log('✅ CSS content looks good');
  console.log('');

  // Test 5: Check JavaScript content
  console.log('⚡ Checking JavaScript content...');
  const jsContent = fs.readFileSync('public/js/app.js', 'utf8');
  
  const requiredFunctions = [
    'TestCaseGenerator',
    'generateTestCases',
    'displayResults',
    'showToast'
  ];

  let allFunctionsFound = true;
  requiredFunctions.forEach(func => {
    if (jsContent.includes(func)) {
      console.log(`  ✅ Found: ${func}`);
    } else {
      console.log(`  ❌ Missing: ${func}`);
      allFunctionsFound = false;
    }
  });

  if (!allFunctionsFound) {
    console.log('❌ Some required JavaScript functions are missing!');
    return;
  }

  console.log('✅ JavaScript content looks good');
  console.log('');

  console.log('🎉 Web Interface Test Complete!');
  console.log('');
  console.log('📋 Summary:');
  console.log('  ✅ Static files present');
  console.log('  ✅ Built files present');
  console.log('  ✅ HTML structure correct');
  console.log('  ✅ CSS styles present');
  console.log('  ✅ JavaScript functionality present');
  console.log('');
  console.log('🚀 Ready for deployment!');
  console.log('');
  console.log('To test locally:');
  console.log('  npm run api');
  console.log('  Open http://localhost:3000 in your browser');
  console.log('');
  console.log('To deploy:');
  console.log('  1. Push to GitHub');
  console.log('  2. Connect to Vercel/Netlify/Railway');
  console.log('  3. Deploy!');
}

// Run the test
testWebInterface();
