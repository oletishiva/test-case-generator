export type LLMGenerateFn = (prompt: string) => Promise<string>;
export interface LocatorServiceOptions {
    preferredStrategy?: 'role' | 'text' | 'label' | 'placeholder' | 'alt' | 'title' | 'testid' | 'css';
    framework?: 'playwright' | 'cypress' | 'selenium';
    groupIntoPOM?: boolean;
}
export declare class LocatorService {
    private generateFn;
    constructor(generateFn: LLMGenerateFn);
    private buildPriorityOrder;
    private toPlaywrightName;
    private buildPrompt;
    generate(input: string, options?: LocatorServiceOptions): Promise<string>;
}
//# sourceMappingURL=locatorService.d.ts.map