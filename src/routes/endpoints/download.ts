import { RouteContext } from '../context';

export function registerDownload({ router, fileUtils }: RouteContext): void {
  router.get('/download/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = `${fileUtils.getOutputDirectory()}/${filename}`;
      const exists = await fileUtils.fileExists(filePath);
      if (!exists) return res.status(404).json({ success: false, error: 'File not found' });
      const content = await fileUtils.readFile(filePath);
      const contentType = filename.endsWith('.json') ? 'application/json' : 'text/typescript';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      res.status(500).json({ success: false, error: 'Failed to download file' });
    }
  });
}


