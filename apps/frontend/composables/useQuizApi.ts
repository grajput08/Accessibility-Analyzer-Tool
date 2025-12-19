import type {
  Quiz,
  QuizSubmission,
  QuizResult,
  Pa11yIssue,
  ErrorResponse,
} from '../types/accessibility';

export const useQuizApi = () => {
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  const generateQuiz = async (issues: Pa11yIssue[]): Promise<Quiz> => {
    try {
      const response = await $fetch<Quiz>(
        `${apiBaseUrl}/api/v1/quiz/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            issues,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error('Quiz generation API error:', error);

      let errorMessage = 'An error occurred while generating the quiz';

      if (error.data) {
        const errorData = error.data as ErrorResponse;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const evaluateQuiz = async (
    quiz: Quiz,
    submissions: QuizSubmission[],
  ): Promise<QuizResult> => {
    try {
      const response = await $fetch<QuizResult>(
        `${apiBaseUrl}/api/v1/quiz/evaluate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            quiz,
            submissions,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error('Quiz evaluation API error:', error);

      let errorMessage = 'An error occurred while evaluating the quiz';

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
    generateQuiz,
    evaluateQuiz,
  };
};

