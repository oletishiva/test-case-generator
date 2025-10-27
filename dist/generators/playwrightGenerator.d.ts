import { HybridAIService } from '../services/hybridAIService';
import { TestCase } from '../types';
export declare class PlaywrightGenerator {
    private aiService;
    constructor(aiService: HybridAIService);
    generatePlaywrightCode(requirement: string, testCases: TestCase[]): Promise<string>;
    generateBasicPlaywrightCode(testCases: TestCase[]): string;
    private sanitizeFunctionName;
    private extractClickTarget;
    private extractInputTarget;
    private extractExpectedText;
}
//# sourceMappingURL=playwrightGenerator.d.ts.map