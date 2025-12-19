import type {
  AccessibilityAnalysisRequest,
  AccessibilityAnalysisResponse,
  ErrorResponse,
  Pa11yIssue,
  LearningModeContent,
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

  const getLearningContent = async (
    code: string,
  ): Promise<LearningModeContent | null> => {
    try {
      // URL encode the code to handle special characters
      const encodedCode = encodeURIComponent(code);
      const response = await $fetch<LearningModeContent>(
        `${apiBaseUrl}/api/v1/learning/${encodedCode}`,
        {
          method: 'GET',
        },
      );

      return response;
    } catch (error: any) {
      // If learning content is not found (404), return null instead of throwing
      if (error.statusCode === 404 || error.status === 404) {
        return null;
      }

      console.error('Learning content API error:', error);
      return null;
    }
  };

  const getLearningContentWithAI = async (
    issue: Pa11yIssue,
  ): Promise<LearningModeContent | null> => {
    try {
      const response = await $fetch<LearningModeContent>(
        `${apiBaseUrl}/api/v1/learning`,
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
      console.error('AI learning content API error:', error);

      let errorMessage = 'An error occurred while generating learning content';

      if (error.data) {
        const errorData = error.data as ErrorResponse;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Try fallback to static content
      return getLearningContent(issue.code);
    }
  };

  return {
    analyzeUrl,
    checkHealth,
    explainIssue,
    getLearningContent,
    getLearningContentWithAI,
  };
};
