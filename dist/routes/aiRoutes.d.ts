import { Router } from 'express';
import { TestCaseGenerator } from '../generators/testCaseGenerator';
import { PlaywrightGenerator } from '../generators/playwrightGenerator';
import { FileUtils } from '../utils/fileUtils';
export declare class AIRoutes {
    private router;
    private testCaseGenerator;
    private playwrightGenerator;
    private fileUtils;
    constructor(testCaseGenerator: TestCaseGenerator, playwrightGenerator: PlaywrightGenerator, fileUtils: FileUtils);
    private setupRoutes;
    getRouter(): Router;
}
//# sourceMappingURL=aiRoutes.d.ts.map