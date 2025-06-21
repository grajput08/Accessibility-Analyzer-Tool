import { Router } from 'express';
import { AccessibilityService } from '../services/accessibilityService';

const router: Router = Router();
const accessibilityService = new AccessibilityService();

// Analyze website accessibility
router.post('/analyze', async (req, res) => {
  try {
    const { url, options } = req.body;

    if (!url) {
      return res.status(400).json({
        error: true,
        message: 'URL is required',
      });
    }

    const report = await accessibilityService.analyzeWebsite(url, options);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: true,
      message: error instanceof Error ? error.message : 'Analysis failed',
    });
  }
});

// Get accessibility guidelines
router.get('/guidelines', (req, res) => {
  try {
    const guidelines = accessibilityService.getAccessibilityGuidelines();

    res.json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    console.error('Guidelines error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch guidelines',
    });
  }
});

// Health check for accessibility service
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'accessibility-analyzer',
    timestamp: new Date().toISOString(),
  });
});

export default router;
