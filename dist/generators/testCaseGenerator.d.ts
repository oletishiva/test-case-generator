import { HybridAIService } from '../services/hybridAIService';
import { GenerationRequest, GenerationResponse } from '../types';
export declare class TestCaseGenerator {
    private aiService;
    constructor(aiService: HybridAIService);
    generate(request: GenerationRequest): Promise<GenerationResponse>;
    private parseTestCases;
}
//# sourceMappingURL=testCaseGenerator.d.ts.map