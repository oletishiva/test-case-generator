export interface TestCase {
    title: string;
    type: 'Positive' | 'Negative';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    steps: string[];
    expected_result: string;
    test_data?: string;
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
    testPyramid?: {
        unit: number;
        integration: number;
        e2e: number;
    };
    prioritizedTestCases?: TestCase[];
    traceabilityMatrix?: Array<{
        requirement: string;
        testCases: string[];
        coverage: string;
    }>;
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
//# sourceMappingURL=index.d.ts.map