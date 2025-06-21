import type {
  AccessibilityAnalysisRequest,
  AccessibilityAnalysisResponse,
  ErrorResponse,
} from '../types/accessibility';

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

  return {
    analyzeUrl,
    checkHealth,
  };
};
