import { AIServiceConfig } from '../types';
export declare class HybridAIService {
    private openaiService?;
    private geminiService?;
    private primary;
    constructor(config: AIServiceConfig);
    generateTestCases(requirement: string): Promise<string>;
    generatePlaywrightCode(requirement: string, testCases: any[]): Promise<string>;
    private getServiceOrder;
    getAvailableServices(): string[];
    getPrimaryService(): string;
}
//# sourceMappingURL=hybridAIService.d.ts.map