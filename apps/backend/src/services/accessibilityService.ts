import axios from 'axios';
import pa11y from 'pa11y';

export interface AccessibilityIssue {
  code: string;
  message: string;
  type: 'error' | 'warning' | 'notice';
  selector: string;
  context: string;
  help: string;
  helpUrl: string;
}

export interface AccessibilityReport {
  url: string;
  timestamp: string;
  issues: AccessibilityIssue[];
  summary: {
    errors: number;
    warnings: number;
    notices: number;
  };
  standards: {
    wcag2a: number;
    wcag2aa: number;
    wcag2aaa: number;
  };
}

export class AccessibilityService {
  /**
   * Analyze a website for accessibility issues using Pa11y
   */
  async analyzeWebsite(url: string, options?: {
    standard?: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA';
    includeNotices?: boolean;
    includeWarnings?: boolean;
  }): Promise<AccessibilityReport> {
    try {
      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL provided');
      }

      // Configure Pa11y options
      const pa11yOptions = {
        standard: options?.standard || 'WCAG2AA',
        includeNotices: options?.includeNotices || false,
        includeWarnings: options?.includeWarnings || true,
        timeout: 30000, // 30 seconds timeout
        wait: 2000, // Wait 2 seconds for dynamic content
        chromeLaunchConfig: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      };

      // Run Pa11y analysis
      const results = await pa11y(url, pa11yOptions);

      // Process results
      const issues: AccessibilityIssue[] = results.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        type: issue.type as 'error' | 'warning' | 'notice',
        selector: issue.selector,
        context: issue.context,
        help: issue.help,
        helpUrl: issue.helpUrl,
      }));

      // Generate summary
      const summary = {
        errors: issues.filter((issue) => issue.type === 'error').length,
        warnings: issues.filter((issue) => issue.type === 'warning').length,
        notices: issues.filter((issue) => issue.type === 'notice').length,
      };

      // Generate standards compliance
      const standards = {
        wcag2a: this.calculateWCAGCompliance(issues, 'WCAG2A'),
        wcag2aa: this.calculateWCAGCompliance(issues, 'WCAG2AA'),
        wcag2aaa: this.calculateWCAGCompliance(issues, 'WCAG2AAA'),
      };

      return {
        url,
        timestamp: new Date().toISOString(),
        issues,
        summary,
        standards,
      };
    } catch (error) {
      console.error('Accessibility analysis failed:', error);
      throw new Error(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate if the provided URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate WCAG compliance percentage
   */
  private calculateWCAGCompliance(issues: AccessibilityIssue[], standard: string): number {
    // This is a simplified calculation
    // In a real implementation, you would map specific WCAG criteria
    const totalCriteria = 50; // Approximate number of criteria for each level
    const errorCount = issues.filter((issue) => issue.type === 'error').length;
    
    return Math.max(0, Math.round(((totalCriteria - errorCount) / totalCriteria) * 100));
  }

  /**
   * Get accessibility guidelines and best practices
   */
  getAccessibilityGuidelines(): Record<string, any> {
    return {
      wcag2a: {
        name: 'WCAG 2.1 Level A',
        description: 'Basic accessibility requirements',
        criteria: [
          '1.1.1 Non-text Content',
          '1.2.1 Audio-only and Video-only (Prerecorded)',
          '1.2.2 Captions (Prerecorded)',
          '1.2.3 Audio Description or Media Alternative (Prerecorded)',
        ],
      },
      wcag2aa: {
        name: 'WCAG 2.1 Level AA',
        description: 'Enhanced accessibility requirements',
        criteria: [
          '1.4.3 Contrast (Minimum)',
          '1.4.4 Resize Text',
          '2.4.6 Headings and Labels',
          '2.4.7 Focus Visible',
        ],
      },
      wcag2aaa: {
        name: 'WCAG 2.1 Level AAA',
        description: 'Highest level of accessibility',
        criteria: [
          '1.4.6 Contrast (Enhanced)',
          '1.4.8 Visual Presentation',
          '2.1.3 Keyboard (No Exception)',
          '2.2.3 No Timing',
        ],
      },
    };
  }
} 