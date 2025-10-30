import { Router } from 'express';
import { TestCaseGenerator } from '../generators/testCaseGenerator';
import { PlaywrightGenerator } from '../generators/playwrightGenerator';
import { FileUtils } from '../utils/fileUtils';

export interface RouteContext {
  router: Router;
  testCaseGenerator: TestCaseGenerator;
  playwrightGenerator: PlaywrightGenerator;
  fileUtils: FileUtils;
}


