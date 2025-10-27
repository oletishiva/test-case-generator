"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridAIService = void 0;
const openaiService_1 = require("./openaiService");
const geminiService_1 = require("./geminiService");
class HybridAIService {
    constructor(config) {
        this.primary = config.primary;
        // Initialize OpenAI service if configured
        if (config.openai?.apiKey) {
            this.openaiService = new openaiService_1.OpenAIService(config.openai);
        }
        // Initialize Gemini service if configured
        if (config.gemini?.apiKey) {
            this.geminiService = new geminiService_1.GeminiService(config.gemini);
        }
        // Validate that at least one service is configured
        if (!this.openaiService && !this.geminiService) {
            throw new Error('At least one AI service (OpenAI or Gemini) must be configured');
        }
    }
    async generateTestCases(requirement) {
        const services = this.getServiceOrder();
        for (const service of services) {
            try {
                console.log(`🤖 Trying ${service.name} for test case generation...`);
                const result = await service.generateTestCases(requirement);
                console.log(`✅ Successfully generated test cases using ${service.name}`);
                return result;
            }
            catch (error) {
                console.warn(`⚠️  ${service.name} failed:`, error instanceof Error ? error.message : 'Unknown error');
                // If this is the last service, throw the error
                if (service === services[services.length - 1]) {
                    throw error;
                }
                // Otherwise, continue to the next service
                console.log(`🔄 Falling back to next available service...`);
            }
        }
        throw new Error('All AI services failed');
    }
    async generatePlaywrightCode(requirement, testCases) {
        const services = this.getServiceOrder();
        for (const service of services) {
            try {
                console.log(`🎭 Trying ${service.name} for Playwright generation...`);
                const result = await service.generatePlaywrightCode(requirement, testCases);
                console.log(`✅ Successfully generated Playwright code using ${service.name}`);
                return result;
            }
            catch (error) {
                console.warn(`⚠️  ${service.name} failed:`, error instanceof Error ? error.message : 'Unknown error');
                // If this is the last service, throw the error
                if (service === services[services.length - 1]) {
                    throw error;
                }
                // Otherwise, continue to the next service
                console.log(`🔄 Falling back to next available service...`);
            }
        }
        throw new Error('All AI services failed');
    }
    getServiceOrder() {
        const services = [];
        // Add primary service first
        if (this.primary === 'openai' && this.openaiService) {
            services.push({
                name: 'OpenAI',
                generateTestCases: this.openaiService.generateTestCases.bind(this.openaiService),
                generatePlaywrightCode: this.openaiService.generatePlaywrightCode.bind(this.openaiService)
            });
        }
        else if (this.primary === 'gemini' && this.geminiService) {
            services.push({
                name: 'Gemini',
                generateTestCases: this.geminiService.generateTestCases.bind(this.geminiService),
                generatePlaywrightCode: this.geminiService.generatePlaywrightCode.bind(this.geminiService)
            });
        }
        // Add fallback service (only if different from primary)
        if (this.primary === 'openai' && this.geminiService) {
            services.push({
                name: 'Gemini (fallback)',
                generateTestCases: this.geminiService.generateTestCases.bind(this.geminiService),
                generatePlaywrightCode: this.geminiService.generatePlaywrightCode.bind(this.geminiService)
            });
        }
        else if (this.primary === 'gemini' && this.openaiService) {
            services.push({
                name: 'OpenAI (fallback)',
                generateTestCases: this.openaiService.generateTestCases.bind(this.openaiService),
                generatePlaywrightCode: this.openaiService.generatePlaywrightCode.bind(this.openaiService)
            });
        }
        // If no services were added, add whatever is available
        if (services.length === 0) {
            if (this.openaiService) {
                services.push({
                    name: 'OpenAI',
                    generateTestCases: this.openaiService.generateTestCases.bind(this.openaiService),
                    generatePlaywrightCode: this.openaiService.generatePlaywrightCode.bind(this.openaiService)
                });
            }
            if (this.geminiService) {
                services.push({
                    name: 'Gemini',
                    generateTestCases: this.geminiService.generateTestCases.bind(this.geminiService),
                    generatePlaywrightCode: this.geminiService.generatePlaywrightCode.bind(this.geminiService)
                });
            }
        }
        return services;
    }
    getAvailableServices() {
        const services = [];
        if (this.openaiService)
            services.push('OpenAI');
        if (this.geminiService)
            services.push('Gemini');
        return services;
    }
    getPrimaryService() {
        return this.primary;
    }
}
exports.HybridAIService = HybridAIService;
//# sourceMappingURL=hybridAIService.js.map