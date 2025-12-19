import { Router, Request, Response } from 'express';
import { AccessibilityService } from '../services/accessibilityService';
import { AIExplanationService } from '../services/aiExplanationService';
import { LearningModeService } from '../services/learningModeService';
import { QuizService, QuizSubmission } from '../services/quizService';
import {
  ErrorResponse,
  IssueExplanationRequest,
  IssueExplanationResponse,
  Pa11yIssue,
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

// Get learning mode content for an issue
// Supports both GET (static content) and POST (AI-generated content)
router.get('/learning/:code', (req: Request, res: Response) => {
  try {
    const code = req.params.code;

    if (!code) {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'Issue code is required',
        timestamp: new Date().toISOString(),
      });
    }

    const learningContent = LearningModeService.getLearningContent(code);

    if (!learningContent) {
      return res.status(404).json({
        error: 'Learning content not found',
        message: `No learning content available for issue code: ${code}`,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json(learningContent);
  } catch (error) {
    console.error('Learning mode error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Learning mode failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return res.status(500).json(errorResponse);
  }
});

// Get AI-generated learning mode content for an issue
router.post('/learning', async (req: Request, res: Response) => {
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

    // Generate AI learning content
    const learningContent = await LearningModeService.getLearningContentWithAI({
      code: request.code,
      context: request.context || '',
      message: request.message,
      selector: request.selector,
      type: request.type || 'error',
    });

    return res.status(200).json(learningContent);
  } catch (error) {
    console.error('AI learning mode error:', error);

    const errorResponse: ErrorResponse = {
      error: 'AI learning mode failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return res.status(500).json(errorResponse);
  }
});

// Generate quiz from accessibility issues
router.post('/quiz/generate', async (req: Request, res: Response) => {
  try {
    const issues: Pa11yIssue[] = req.body.issues;

    // Validate request
    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'issues array is required and must not be empty',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate quiz
    const quiz = await QuizService.generateQuiz(issues);

    return res.status(200).json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Quiz generation failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return res.status(500).json(errorResponse);
  }
});

// Evaluate quiz submission
router.post('/quiz/evaluate', async (req: Request, res: Response) => {
  try {
    const { quiz, submissions } = req.body;

    // Validate request
    if (!quiz || !submissions || !Array.isArray(submissions)) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'quiz and submissions array are required',
        timestamp: new Date().toISOString(),
      });
    }

    // Evaluate quiz
    const result = await QuizService.evaluateQuiz(quiz, submissions);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Quiz evaluation error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Quiz evaluation failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return res.status(500).json(errorResponse);
  }
});

export default router;
