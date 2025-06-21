import { Router, Request, Response } from 'express';
import { AccessibilityService } from '../services/accessibilityService';
import { ErrorResponse } from '../types/accessibility';

const router: Router = Router();

// Health check for accessibility service
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'accessibility-analyzer',
    timestamp: new Date().toISOString(),
  });
});

// Analyze URL for accessibility issues
router.post('/analyse', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validatedRequest = AccessibilityService.validateRequest(req.body);

    // Perform accessibility analysis
    const results = await AccessibilityService.analyzeUrl(validatedRequest);

    return res.status(200).json(results);
  } catch (error) {
    console.error('Accessibility analysis error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Accessibility analysis failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return res.status(400).json(errorResponse);
  }
});

export default router;
