export interface AccessibilityAnalysisRequest {
  url: string;
  standard?: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' | 'Section508';
  includeWarnings?: boolean;
  includeNotices?: boolean;
  actions?: string[];
  wait?: number;
  timeout?: number;
  hideElements?: string;
  chromeLaunchConfig?: {
    args?: string[];
    executablePath?: string;
  };
}

export interface Pa11yIssue {
  code: string;
  context: string;
  message: string;
  selector: string;
  type: 'error' | 'warning' | 'notice';
  runnerExtras?: Record<string, any>;
}

export interface AccessibilityAnalysisResponse {
  documentTitle: string;
  pageUrl: string;
  issues: Pa11yIssue[];
  standards: {
    [key: string]: {
      errors: number;
      warnings: number;
      notices: number;
    };
  };
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  timestamp: string;
}

export interface AccessibilityState {
  isLoading: boolean;
  results: AccessibilityAnalysisResponse | null;
  error: string | null;
  history: AccessibilityAnalysisResponse[];
}
