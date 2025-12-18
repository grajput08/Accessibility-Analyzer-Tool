import { Router, Request, Response } from 'express';
import { AccessibilityService } from '../services/accessibilityService';
import { AIExplanationService } from '../services/aiExplanationService';
import {
  ErrorResponse,
  IssueExplanationRequest,
  IssueExplanationResponse,
} from '../types/accessibility';

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

// Explain an accessibility issue using AI
router.post('/explain-issue', async (req: Request, res: Response) => {
  try {
    const request: IssueExplanationRequest = req.body;

    // Validate request
    if (!request.code || !request.message || !request.selector) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'code, message, and selector are required',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate explanation
    const explanation = await AIExplanationService.explainIssue({
      code: request.code,
      context: request.context || '',
      message: request.message,
      selector: request.selector,
      type: request.type || 'error',
    });

    return res.status(200).json(explanation);
  } catch (error) {
    console.error('Issue explanation error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Issue explanation failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return res.status(500).json(errorResponse);
  }
});

export default router;
