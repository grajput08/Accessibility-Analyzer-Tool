import type {
  AccessibilityAnalysisRequest,
  AccessibilityAnalysisResponse,
  ErrorResponse,
  Pa11yIssue,
} from '../types/accessibility';

import type { CodeFix, Suggestion, IssueDetails } from '../types/accessibility';

export interface IssueExplanationResponse {
  explanation: string;
  fix: string;
  details: IssueDetails;
  suggestions: Suggestion[];
  codeFixes: CodeFix[];
}

export const useAccessibilityApi = () => {
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  const analyzeUrl = async (
    request: AccessibilityAnalysisRequest,
  ): Promise<AccessibilityAnalysisResponse> => {
    try {
      const response = await $fetch<AccessibilityAnalysisResponse>(
        `${apiBaseUrl}/api/v1/analyse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: request,
        },
      );

      return response;
    } catch (error: any) {
      console.error('Accessibility API error:', error);

      let errorMessage = 'An error occurred while analyzing the URL';

      if (error.data) {
        const errorData = error.data as ErrorResponse;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const checkHealth = async () => {
    try {
      const response = await $fetch(`${apiBaseUrl}/api/v1/health`);
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  };

  const explainIssue = async (
    issue: Pa11yIssue,
  ): Promise<IssueExplanationResponse> => {
    try {
      const response = await $fetch<IssueExplanationResponse>(
        `${apiBaseUrl}/api/v1/explain-issue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            code: issue.code,
            context: issue.context,
            message: issue.message,
            selector: issue.selector,
            type: issue.type,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error('Issue explanation API error:', error);

      let errorMessage = 'An error occurred while generating the explanation';

      if (error.data) {
        const errorData = error.data as ErrorResponse;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  return {
    analyzeUrl,
    checkHealth,
    explainIssue,
  };
};
