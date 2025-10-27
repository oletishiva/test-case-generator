import * as fs from 'fs';
import * as path from 'path';
import { TestCase } from '../types';

export class FileUtils {
  private outputDir: string;

  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${this.outputDir}`);
    }
  }

  async saveTestCases(testCases: TestCase[], filename: string = 'testcases.json'): Promise<string> {
    try {
      const filePath = path.join(this.outputDir, filename);
      const jsonContent = JSON.stringify(testCases, null, 2);
      
      await fs.promises.writeFile(filePath, jsonContent, 'utf8');
      console.log(`💾 Saved test cases to: ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error('❌ Error saving test cases:', error);
      throw new Error(`Failed to save test cases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async savePlaywrightCode(code: string, filename: string = 'generated.spec.ts'): Promise<string> {
    try {
      const filePath = path.join(this.outputDir, filename);
      
      await fs.promises.writeFile(filePath, code, 'utf8');
      console.log(`🎭 Saved Playwright code to: ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error('❌ Error saving Playwright code:', error);
      throw new Error(`Failed to save Playwright code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveGeneratedTests(testCases: TestCase[], playwrightCode: string, baseFilename: string = 'generated'): Promise<{ testCasesPath: string; playwrightPath: string }> {
    try {
      // Generate timestamp for unique filenames
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      
      const testCasesFilename = `${baseFilename}_${timestamp}.json`;
      const playwrightFilename = `${baseFilename}_${timestamp}.spec.ts`;
      
      const testCasesPath = await this.saveTestCases(testCases, testCasesFilename);
      const playwrightPath = await this.savePlaywrightCode(playwrightCode, playwrightFilename);
      
      return { testCasesPath, playwrightPath };
    } catch (error) {
      console.error('❌ Error saving generated tests:', error);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.promises.readFile(filePath, 'utf8');
    } catch (error) {
      console.error('❌ Error reading file:', error);
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getOutputDirectory(): string {
    return this.outputDir;
  }

  listGeneratedFiles(): string[] {
    try {
      const files = fs.readdirSync(this.outputDir);
      return files.filter((file: string) => 
        file.endsWith('.json') || 
        file.endsWith('.spec.ts') || 
        file.endsWith('.ts')
      );
    } catch (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }
  }

  async cleanupOldFiles(maxAgeHours: number = 24): Promise<void> {
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
    } catch (error) {
      console.error('❌ Error cleaning up files:', error);
    }
  }
}
