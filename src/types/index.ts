export interface TestCase {
  title: string;
  type: 'Positive' | 'Negative';
  steps: string[];
  expected_result: string;
}

export interface GenerationRequest {
  requirement: string;
  generatePlaywright?: boolean;
}

export interface GenerationResponse {
  testCases: TestCase[];
  playwrightCode?: string;
  success: boolean;
  error?: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface AIServiceConfig {
  primary: 'openai' | 'gemini';
  openai?: OpenAIConfig;
  gemini?: GeminiConfig;
}
