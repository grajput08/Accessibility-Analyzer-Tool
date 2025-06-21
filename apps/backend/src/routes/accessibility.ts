import { Router } from 'express';

const router: Router = Router();

// Health check for accessibility service
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'accessibility-analyzer',
    timestamp: new Date().toISOString(),
  });
});

export default router;
