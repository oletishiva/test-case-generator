import { TestCase } from '../types';
export declare class FileUtils {
    private outputDir;
    constructor(outputDir?: string);
    private ensureOutputDirectory;
    saveTestCases(testCases: TestCase[], filename?: string): Promise<string>;
    savePlaywrightCode(code: string, filename?: string): Promise<string>;
    saveGeneratedTests(testCases: TestCase[], playwrightCode: string | undefined, baseFilename?: string): Promise<{
        testCasesPath: string;
        playwrightPath?: string;
    }>;
    readFile(filePath: string): Promise<string>;
    fileExists(filePath: string): Promise<boolean>;
    getOutputDirectory(): string;
    listGeneratedFiles(): string[];
    cleanupOldFiles(maxAgeHours?: number): Promise<void>;
}
//# sourceMappingURL=fileUtils.d.ts.map