"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCleanup = registerCleanup;
function registerCleanup({ router, fileUtils }) {
    router.post('/cleanup', async (req, res) => {
        try {
            const { maxAgeHours = 24 } = req.body || {};
            await fileUtils.cleanupOldFiles(maxAgeHours);
            res.json({ success: true, message: `Cleaned up files older than ${maxAgeHours} hours` });
        }
        catch (error) {
            console.error('❌ Error cleaning up files:', error);
            res.status(500).json({ success: false, error: 'Failed to cleanup files' });
        }
    });
}
//# sourceMappingURL=cleanup.js.map