"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileUtils {
    constructor(outputDir = './output') {
        this.outputDir = outputDir;
        this.ensureOutputDirectory();
    }
    ensureOutputDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${this.outputDir}`);
        }
    }
    async saveTestCases(testCases, filename = 'testcases.json') {
        try {
            const filePath = path.join(this.outputDir, filename);
            const jsonContent = JSON.stringify(testCases, null, 2);
            await fs.promises.writeFile(filePath, jsonContent, 'utf8');
            console.log(`💾 Saved test cases to: ${filePath}`);
            return filePath;
        }
        catch (error) {
            console.error('❌ Error saving test cases:', error);
            throw new Error(`Failed to save test cases: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async savePlaywrightCode(code, filename = 'generated.spec.ts') {
        try {
            const filePath = path.join(this.outputDir, filename);
            await fs.promises.writeFile(filePath, code, 'utf8');
            console.log(`🎭 Saved Playwright code to: ${filePath}`);
            return filePath;
        }
        catch (error) {
            console.error('❌ Error saving Playwright code:', error);
            throw new Error(`Failed to save Playwright code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async saveGeneratedTests(testCases, playwrightCode, baseFilename = 'generated') {
        try {
            // Generate timestamp for unique filenames
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const testCasesFilename = `${baseFilename}_${timestamp}.json`;
            // Always save test cases
            const testCasesPath = await this.saveTestCases(testCases, testCasesFilename);
            let playwrightPath;
            // Only save Playwright code if it exists and is not empty
            if (playwrightCode && playwrightCode.trim().length > 0) {
                const playwrightFilename = `${baseFilename}_${timestamp}.spec.ts`;
                playwrightPath = await this.savePlaywrightCode(playwrightCode, playwrightFilename);
                console.log(`🎭 Playwright code saved: ${playwrightPath}`);
            }
            else {
                console.log('🎭 No Playwright code generated - skipping file creation');
            }
            return { testCasesPath, playwrightPath };
        }
        catch (error) {
            console.error('❌ Error saving generated tests:', error);
            throw error;
        }
    }
    async readFile(filePath) {
        try {
            return await fs.promises.readFile(filePath, 'utf8');
        }
        catch (error) {
            console.error('❌ Error reading file:', error);
            throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    getOutputDirectory() {
        return this.outputDir;
    }
    listGeneratedFiles() {
        try {
            const files = fs.readdirSync(this.outputDir);
            return files.filter((file) => file.endsWith('.json') ||
                file.endsWith('.spec.ts') ||
                file.endsWith('.ts'));
        }
        catch (error) {
            console.error('❌ Error listing files:', error);
            return [];
        }
    }
    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const files = this.listGeneratedFiles();
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
            for (const file of files) {
                const filePath = path.join(this.outputDir, file);
                const stats = await fs.promises.stat(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.promises.unlink(filePath);
                    console.log(`🗑️  Cleaned up old file: ${file}`);
                }
            }
        }
        catch (error) {
            console.error('❌ Error cleaning up files:', error);
        }
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=fileUtils.js.map