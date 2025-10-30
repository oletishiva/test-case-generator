"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealth = registerHealth;
function registerHealth({ router }) {
    router.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'Test Case Generator API' });
    });
}
//# sourceMappingURL=health.js.map