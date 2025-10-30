"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFiles = registerFiles;
function registerFiles({ router, fileUtils }) {
    router.get('/files', (req, res) => {
        try {
            const files = fileUtils.listGeneratedFiles();
            res.json({
                success: true,
                files: files.map(name => ({ name, path: `/output/${name}`, type: name.endsWith('.json') ? 'test-cases' : 'playwright' }))
            });
        }
        catch (error) {
            console.error('❌ Error listing files:', error);
            res.status(500).json({ success: false, error: 'Failed to list files' });
        }
    });
}
//# sourceMappingURL=files.js.map