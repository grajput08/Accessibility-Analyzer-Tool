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

export interface CodeFix {
  description: string;
  beforeCode: string;
  afterCode: string;
  explanation: string;
}

export interface Suggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  example?: string;
}

export interface IssueDetails {
  impact: string;
  wcagGuideline: string;
  affectedUsers: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface Pa11yIssue {
  code: string;
  context: string;
  message: string;
  selector: string;
  type: 'error' | 'warning' | 'notice';
  runnerExtras?: Record<string, any>;
  explanation?: string;
  fix?: string;
  details?: IssueDetails;
  suggestions?: Suggestion[];
  codeFixes?: CodeFix[];
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
  aimScore: number;
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
