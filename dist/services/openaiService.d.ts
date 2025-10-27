import { OpenAIConfig } from '../types';
export declare class OpenAIService {
    private client;
    private config;
    constructor(config: OpenAIConfig);
    generateTestCases(requirement: string): Promise<string>;
    generatePlaywrightCode(requirement: string, testCases: any[]): Promise<string>;
}
//# sourceMappingURL=openaiService.d.ts.map