import { RouteContext } from '../context';

export function registerHealth({ router }: RouteContext): void {
  router.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'Test Case Generator API' });
  });
}


