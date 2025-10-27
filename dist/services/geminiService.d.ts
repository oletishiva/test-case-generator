import { GeminiConfig } from '../types';
export declare class GeminiService {
    private genAI;
    private model;
    private config;
    constructor(config: GeminiConfig);
    generateTestCases(requirement: string): Promise<string>;
    generatePlaywrightCode(requirement: string, testCases: any[]): Promise<string>;
}
//# sourceMappingURL=geminiService.d.ts.map