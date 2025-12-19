import pa11y from 'pa11y';
import {
  AccessibilityAnalysisRequest,
  AccessibilityAnalysisResponse,
  Pa11yIssue,
} from '../types/accessibility';

export class AccessibilityService {
  /**
   * Analyze a URL for accessibility issues using Pa11y
   */
  static async analyzeUrl(
    request: AccessibilityAnalysisRequest
  ): Promise<AccessibilityAnalysisResponse> {
    try {
      // Validate URL
      const url = new URL(request.url);

      // Configure Pa11y options
      const pa11yOptions = {
        standard: request.standard || 'WCAG2AA',
        includeWarnings: request.includeWarnings ?? true,
        includeNotices: request.includeNotices ?? true,
        actions: request.actions || [],
        wait: request.wait || 0,
        timeout: request.timeout || 30000,
        hideElements: request.hideElements || '',
        chromeLaunchConfig: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          ignoreHTTPSErrors: true,
          executablePath: '',
        },
        log: {
          debug: console.log,
          error: console.error,
          info: console.log,
        },
      };

      // Run Pa11y analysis
      const results = await pa11y(url.toString(), pa11yOptions);

      // Process and format results
      const issues: Pa11yIssue[] = results.issues.map(issue => ({
        code: issue.code,
        context: issue.context,
        message: issue.message,
        selector: issue.selector,
        type: issue.type as 'error' | 'warning' | 'notice',
      }));

      // Calculate standards summary
      const standards = {
        [pa11yOptions.standard]: {
          errors: issues.filter(issue => issue.type === 'error').length,
          warnings: issues.filter(issue => issue.type === 'warning').length,
          notices: issues.filter(issue => issue.type === 'notice').length,
        },
      };

      return {
        documentTitle: results.documentTitle,
        pageUrl: results.pageUrl,
        issues,
        standards,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Accessibility analysis error:', error);
      throw new Error(
        `Failed to analyze accessibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate accessibility analysis request
   */
  static validateRequest(request: any): AccessibilityAnalysisRequest {
    if (!request.url) {
      throw new Error('URL is required');
    }

    try {
      new URL(request.url);
    } catch {
      throw new Error('Invalid URL format');
    }

    return {
      url: request.url,
      standard: request.standard,
      includeWarnings: request.includeWarnings,
      includeNotices: request.includeNotices,
      actions: request.actions,
      wait: request.wait,
      timeout: request.timeout,
      hideElements: request.hideElements,
      chromeLaunchConfig: request.chromeLaunchConfig,
    };
  }
}
