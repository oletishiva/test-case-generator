import { HybridAIService } from '../services/hybridAIService';
import { TestCase, GenerationRequest, GenerationResponse } from '../types';

export class TestCaseGenerator {
  private aiService: HybridAIService;

  constructor(aiService: HybridAIService) {
    this.aiService = aiService;
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      console.log('🤖 Generating test cases for requirement:', request.requirement);
      
      // Generate test cases using AI service (with fallback)
      const testCasesJson = await this.aiService.generateTestCases(request.requirement);
      
      // Parse the JSON response
      const testCases = this.parseTestCases(testCasesJson);
      
      console.log(`✅ Generated ${testCases.length} test cases`);
      
      const response: GenerationResponse = {
        testCases,
        success: true
      };

      return response;
    } catch (error) {
      console.error('❌ Error generating test cases:', error);
      return {
        testCases: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private parseTestCases(jsonString: string): TestCase[] {
    try {
      // Clean the JSON string - remove any markdown formatting
      let cleanJson = jsonString.trim();
      
      // Remove markdown code blocks if present
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Handle incomplete JSON by trying to fix common truncation issues
      if (!cleanJson.endsWith(']')) {
        // Try to complete the JSON if it looks truncated
        const lastCompleteObject = cleanJson.lastIndexOf('},');
        if (lastCompleteObject > 0) {
          cleanJson = cleanJson.substring(0, lastCompleteObject + 1) + ']';
        } else if (cleanJson.endsWith('"')) {
          // If it ends with a quote, try to close the current object
          cleanJson = cleanJson + '}]';
        }
      }

      const parsed = JSON.parse(cleanJson);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate each test case
      return parsed.map((testCase, index) => {
        if (!testCase.title || !testCase.type || !testCase.steps || !testCase.expected_result) {
          throw new Error(`Invalid test case at index ${index}: missing required fields`);
        }

        if (!['Positive', 'Negative'].includes(testCase.type)) {
          throw new Error(`Invalid test case type at index ${index}: must be 'Positive' or 'Negative'`);
        }

        if (!Array.isArray(testCase.steps)) {
          throw new Error(`Invalid steps at index ${index}: must be an array`);
        }

        return {
          title: String(testCase.title),
          type: testCase.type as 'Positive' | 'Negative' | 'Edge Case' | 'Security' | 'Performance',
          priority: testCase.priority as 'High' | 'Medium' | 'Low' || 'Medium',
          steps: testCase.steps.map((step: any) => String(step)),
          expected_result: String(testCase.expected_result),
          test_data: testCase.test_data ? String(testCase.test_data) : undefined
        };
      });
    } catch (error) {
      console.error('Error parsing test cases JSON:', error);
      console.error('Raw response:', jsonString);
      throw new Error(`Failed to parse test cases: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
  }
}
