"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseGenerator = void 0;
class TestCaseGenerator {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async generate(request) {
        try {
            console.log('🤖 Generating test cases for requirement:', request.requirement);
            // Generate test cases using AI service (with fallback)
            const testCasesJson = await this.aiService.generateTestCases(request.requirement);
            // Parse the JSON response
            const testCases = this.parseTestCases(testCasesJson);
            console.log(`✅ Generated ${testCases.length} test cases`);
            const response = {
                testCases,
                success: true
            };
            return response;
        }
        catch (error) {
            console.error('❌ Error generating test cases:', error);
            return {
                testCases: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    // New method for parallel generation
    async generateWithPlaywright(request, playwrightGenerator) {
        try {
            console.log('🤖 Generating test cases and Playwright code in parallel...');
            // Start both processes in parallel
            const [testCasesResult, playwrightResult] = await Promise.allSettled([
                this.generate(request),
                request.generatePlaywright ? playwrightGenerator.generatePlaywrightCode(request.requirement, []) : Promise.resolve('')
            ]);
            const testCases = testCasesResult.status === 'fulfilled' ? testCasesResult.value : { testCases: [], success: false };
            const playwrightCode = playwrightResult.status === 'fulfilled' ? playwrightResult.value : '';
            if (!testCases.success) {
                throw new Error(testCases.error || 'Failed to generate test cases');
            }
            console.log(`✅ Generated ${testCases.testCases.length} test cases and Playwright code in parallel`);
            return {
                testCases: testCases.testCases,
                playwrightCode,
                success: true
            };
        }
        catch (error) {
            console.error('❌ Error in parallel generation:', error);
            return {
                testCases: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    parseTestCases(jsonString) {
        try {
            console.log('🔍 Raw JSON response length:', jsonString.length);
            console.log('🔍 Raw JSON preview:', jsonString.substring(0, 500) + '...');
            console.log('🔍 Raw JSON end:', jsonString.substring(jsonString.length - 200));
            // Clean the JSON string - remove any markdown formatting
            let cleanJson = jsonString.trim();
            // Remove markdown code blocks if present
            if (cleanJson.startsWith('```json')) {
                cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            }
            else if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            // Handle incomplete JSON by trying to fix common truncation issues
            if (!cleanJson.endsWith(']')) {
                // Try to complete the JSON if it looks truncated
                // Look for the last complete test case object
                const lastCompleteObject = cleanJson.lastIndexOf('}');
                if (lastCompleteObject > 0) {
                    // Find the start of the last complete object
                    const lastObjectStart = cleanJson.lastIndexOf('{', lastCompleteObject);
                    if (lastObjectStart > 0) {
                        // Keep all complete objects and close the array
                        cleanJson = cleanJson.substring(0, lastCompleteObject + 1) + ']';
                    }
                    else {
                        // If we can't find a complete object, try to close what we have
                        cleanJson = cleanJson + '}]';
                    }
                }
                else if (cleanJson.endsWith('"')) {
                    // If it ends with a quote, try to close the current object
                    cleanJson = cleanJson + '}]';
                }
            }
            let parsed;
            try {
                parsed = JSON.parse(cleanJson);
            }
            catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Problematic JSON:', cleanJson);
                // Try to fix common JSON issues
                let fixedJson = cleanJson;
                // Fix unescaped quotes in strings
                fixedJson = fixedJson.replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1\\\\$2');
                // Fix missing commas between objects
                fixedJson = fixedJson.replace(/}\s*{/g, '},{');
                // Fix trailing commas
                fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
                // Try parsing again
                try {
                    parsed = JSON.parse(fixedJson);
                }
                catch (secondError) {
                    console.error('Second parse attempt failed:', secondError);
                    throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
                }
            }
            if (!Array.isArray(parsed)) {
                throw new Error('Response is not an array');
            }
            // Process each test case with lenient validation
            return parsed.map((testCase, index) => {
                // Log any missing fields for debugging
                if (!testCase.title)
                    console.warn(`Test case ${index}: missing title`);
                if (!testCase.type)
                    console.warn(`Test case ${index}: missing type`);
                if (!testCase.steps)
                    console.warn(`Test case ${index}: missing steps`);
                if (!testCase.expected_result)
                    console.warn(`Test case ${index}: missing expected_result`);
                return {
                    title: String(testCase.title || 'Untitled Test Case'),
                    type: testCase.type || 'Positive',
                    priority: testCase.priority || 'Medium',
                    steps: Array.isArray(testCase.steps) ? testCase.steps.map((step) => String(step)) : ['Step not specified'],
                    expected_result: String(testCase.expected_result || 'Expected result not specified'),
                    test_data: testCase.test_data ? String(testCase.test_data) : undefined
                };
            });
        }
        catch (error) {
            console.error('Error parsing test cases JSON:', error);
            console.error('Raw response:', jsonString);
            throw new Error(`Failed to parse test cases: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
        }
    }
}
exports.TestCaseGenerator = TestCaseGenerator;
//# sourceMappingURL=testCaseGenerator.js.map