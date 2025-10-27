#!/usr/bin/env node
declare class TestCaseGeneratorApp {
    private aiService;
    private testCaseGenerator;
    private playwrightGenerator;
    private fileUtils;
    constructor();
    generateTestCases(requirement: string, generatePlaywright?: boolean): Promise<void>;
    startAPIServer(port?: number): void;
}
export { TestCaseGeneratorApp };
//# sourceMappingURL=main.d.ts.map