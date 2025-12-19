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
  learningContent?: LearningModeContent;
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

export interface LearningModeContent {
  whyItMatters: string;
  wcagGuideline: string;
  howToTestManually: string | string[];
  articleLinks?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  youtubeVideoLinks?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

export interface AccessibilityState {
  isLoading: boolean;
  results: AccessibilityAnalysisResponse | null;
  error: string | null;
  history: AccessibilityAnalysisResponse[];
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'code' | 'true-false' | 'scenario';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  topic: string;
  points: number;
  codeSnippet?: string;
  scenario?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  topics: string[];
  totalPoints: number;
  estimatedTime: number;
  createdAt: string;
}

export interface QuizSubmission {
  questionId: string;
  answer: string;
}

export interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
    pointsPossible: number;
    explanation: string;
    topic: string;
  }>;
  topicsToReview: string[];
  recommendations: string[];
}
