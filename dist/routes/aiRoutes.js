"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRoutes = void 0;
const express_1 = require("express");
const health_1 = require("./endpoints/health");
const jira_1 = require("./endpoints/jira");
const generate_1 = require("./endpoints/generate");
const locators_1 = require("./endpoints/locators");
const files_1 = require("./endpoints/files");
const download_1 = require("./endpoints/download");
const cleanup_1 = require("./endpoints/cleanup");
class AIRoutes {
    constructor(testCaseGenerator, playwrightGenerator, fileUtils) {
        this.router = (0, express_1.Router)();
        this.testCaseGenerator = testCaseGenerator;
        this.playwrightGenerator = playwrightGenerator;
        this.fileUtils = fileUtils;
        this.setupRoutes();
    }
    setupRoutes() {
        const ctx = {
            router: this.router,
            testCaseGenerator: this.testCaseGenerator,
            playwrightGenerator: this.playwrightGenerator,
            fileUtils: this.fileUtils,
        };
        (0, health_1.registerHealth)(ctx);
        (0, jira_1.registerJira)(ctx);
        (0, generate_1.registerGenerate)(ctx);
        (0, locators_1.registerLocators)(ctx);
        (0, files_1.registerFiles)(ctx);
        (0, download_1.registerDownload)(ctx);
        (0, cleanup_1.registerCleanup)(ctx);
    }
    getRouter() {
        return this.router;
    }
    applyTestPyramid(testCases, testPyramid) {
        const total = testCases.length;
        const unitCount = Math.round((testPyramid.unit / 100) * total);
        const integrationCount = Math.round((testPyramid.integration / 100) * total);
        const e2eCount = total - unitCount - integrationCount;
        let unitTests = testCases.slice(0, unitCount);
        let integrationTests = testCases.slice(unitCount, unitCount + integrationCount);
        let e2eTests = testCases.slice(unitCount + integrationCount);
        // Add test type information
        unitTests = unitTests.map(tc => ({ ...tc, testType: 'Unit' }));
        integrationTests = integrationTests.map(tc => ({ ...tc, testType: 'Integration' }));
        e2eTests = e2eTests.map(tc => ({ ...tc, testType: 'E2E' }));
        return [...unitTests, ...integrationTests, ...e2eTests];
    }
    applyPrioritizationRules(testCases, rules) {
        return testCases.map(tc => {
            let priority = 'Medium'; // Default priority
            // Apply prioritization rules
            if (rules.critical && (tc.title.toLowerCase().includes('security') ||
                tc.title.toLowerCase().includes('data') ||
                tc.title.toLowerCase().includes('critical'))) {
                priority = 'Critical';
            }
            else if (rules.high && (tc.title.toLowerCase().includes('login') ||
                tc.title.toLowerCase().includes('user') ||
                tc.title.toLowerCase().includes('core'))) {
                priority = 'High';
            }
            else if (rules.medium && (tc.title.toLowerCase().includes('edge') ||
                tc.title.toLowerCase().includes('error') ||
                tc.title.toLowerCase().includes('validation'))) {
                priority = 'Medium';
            }
            else if (rules.low && (tc.title.toLowerCase().includes('ui') ||
                tc.title.toLowerCase().includes('display') ||
                tc.title.toLowerCase().includes('cosmetic'))) {
                priority = 'Low';
            }
            return { ...tc, priority };
        });
    }
    generateTraceabilityMatrix(requirement, testCases) {
        // Simple traceability matrix generation
        // In a real implementation, this would be more sophisticated
        const requirements = requirement.split('\n').filter(line => line.trim().length > 0);
        return requirements.map((req, index) => {
            const relatedTestCases = testCases.filter(tc => tc.title.toLowerCase().includes(req.toLowerCase().substring(0, 10)) ||
                tc.steps.some((step) => step.toLowerCase().includes(req.toLowerCase().substring(0, 10))));
            return {
                requirement: req.substring(0, 100) + (req.length > 100 ? '...' : ''),
                testCases: relatedTestCases.map(tc => tc.title),
                coverage: relatedTestCases.length > 0 ? 'Full' : 'Not Covered'
            };
        });
    }
}
exports.AIRoutes = AIRoutes;
//# sourceMappingURL=aiRoutes.js.map