import fetch from 'node-fetch';
import { Pa11yIssue } from '../types/accessibility';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'code' | 'true-false' | 'scenario';
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string | string[]; // Can be array for code questions with multiple valid solutions
  explanation: string;
  topic: string; // The accessibility issue topic this question covers
  points: number;
  codeSnippet?: string; // For code-based questions
  scenario?: string; // For scenario-based questions
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  topics: string[]; // List of accessibility issues covered
  totalPoints: number;
  estimatedTime: number; // in minutes
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
  topicsToReview: string[]; // Topics where user scored poorly
  recommendations: string[]; // AI-generated recommendations
}

export class QuizService {
  private static readonly OPENAI_API_URL =
    'https://api.openai.com/v1/chat/completions';
  private static readonly OPENAI_MODEL = 'gpt-4o-mini';

  /**
   * Generate a quiz based on detected accessibility issues
   */
  static async generateQuiz(issues: Pa11yIssue[]): Promise<Quiz> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const quiz = await this.generateAIQuiz(issues, apiKey);
      return quiz;
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw new Error(
        `Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate quiz using OpenAI API
   */
  private static async generateAIQuiz(
    issues: Pa11yIssue[],
    apiKey: string
  ): Promise<Quiz> {
    // Extract unique topics from issues
    const topics = this.extractTopics(issues);
    const prompt = this.buildQuizPrompt(issues, topics);

    const response = await fetch(this.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert accessibility educator. Generate comprehensive, educational quiz questions based on accessibility issues. Create questions that test understanding, not just memorization. Include a mix of question types: multiple choice, code fixes, true/false, and scenario-based questions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    try {
      const parsed = JSON.parse(content);
      return this.parseQuizResponse(parsed, topics);
    } catch (parseError) {
      throw new Error(
        `Failed to parse OpenAI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
      );
    }
  }

  /**
   * Extract unique topics from issues
   */
  private static extractTopics(issues: Pa11yIssue[]): string[] {
    const topicSet = new Set<string>();

    issues.forEach(issue => {
      // Extract topic from issue code or message
      const topic = this.extractTopicFromIssue(issue);
      if (topic) {
        topicSet.add(topic);
      }
    });

    return Array.from(topicSet);
  }

  /**
   * Extract topic name from issue
   */
  private static extractTopicFromIssue(issue: Pa11yIssue): string {
    const message = issue.message.toLowerCase();
    const code = issue.code.toLowerCase();

    // Map common issue patterns to topics
    if (message.includes('alt') || code.includes('image')) {
      return 'Missing alt text';
    }
    if (message.includes('contrast') || code.includes('contrast')) {
      return 'Color contrast';
    }
    if (message.includes('heading') || code.includes('heading')) {
      return 'Heading hierarchy';
    }
    if (message.includes('link') || code.includes('link')) {
      return 'Link accessibility';
    }
    if (message.includes('form') || code.includes('form')) {
      return 'Form accessibility';
    }
    if (message.includes('aria') || code.includes('aria')) {
      return 'ARIA attributes';
    }
    if (message.includes('keyboard') || code.includes('keyboard')) {
      return 'Keyboard navigation';
    }
    if (message.includes('focus') || code.includes('focus')) {
      return 'Focus management';
    }
    if (message.includes('label') || code.includes('label')) {
      return 'Form labels';
    }
    if (message.includes('semantic') || code.includes('semantic')) {
      return 'Semantic HTML';
    }

    // Default: use issue code or first part of message
    return issue.code || message.split('.')[0] || 'Accessibility issue';
  }

  /**
   * Build prompt for quiz generation
   */
  private static buildQuizPrompt(
    issues: Pa11yIssue[],
    topics: string[]
  ): string {
    const issuesSummary = issues
      .slice(0, 10) // Limit to first 10 issues for prompt
      .map(issue => `- ${issue.message} (Code: ${issue.code})`)
      .join('\n');

    return `Generate a comprehensive accessibility quiz based on the following detected issues:

Topics to cover:
${topics.map(t => `- ${t}`).join('\n')}

Sample issues:
${issuesSummary}

Create exactly 5 quiz questions with the following distribution:
- 3 Multiple Choice Questions (MCQ)
- 1 Code-based question (ask user to fix code)
- 1 Scenario-based question

For each question, provide:
1. Clear, educational question text
2. Correct answer(s)
3. Detailed explanation
4. Topic it covers
5. Points (10 points each)

For MCQ questions, provide 4 options with only one correct answer.
For code questions, provide the broken code snippet and expected fix.
For scenario questions, describe a real-world accessibility problem.

Return the response in the following JSON format:
{
  "title": "Accessibility Quiz: [Topics]",
  "description": "Test your understanding of accessibility issues found on your website",
  "questions": [
    {
      "type": "mcq|code|true-false|scenario",
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // Only for MCQ
      "correctAnswer": "Correct answer",
      "explanation": "Detailed explanation of why this is correct",
      "topic": "Topic name",
      "points": 10,
      "codeSnippet": "Code here if type is 'code'",
      "scenario": "Scenario description if type is 'scenario'"
    }
  ]
}`;
  }

  /**
   * Parse AI response into Quiz object
   */
  private static parseQuizResponse(parsed: any, topics: string[]): Quiz {
    const questions: QuizQuestion[] = [];

    if (Array.isArray(parsed.questions)) {
      parsed.questions.forEach((q: any, index: number) => {
        const question: QuizQuestion = {
          id: `q${index + 1}`,
          type: this.validateQuestionType(q.type),
          question: q.question || '',
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || '',
          topic: q.topic || topics[0] || 'Accessibility',
          points: q.points || 10,
        };

        if (question.type === 'mcq' && Array.isArray(q.options)) {
          question.options = q.options;
        }

        if (question.type === 'code' && q.codeSnippet) {
          question.codeSnippet = q.codeSnippet;
        }

        if (question.type === 'scenario' && q.scenario) {
          question.scenario = q.scenario;
        }

        questions.push(question);
      });
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const estimatedTime = Math.ceil(questions.length * 2); // 2 minutes per question

    return {
      id: `quiz-${Date.now()}`,
      title: parsed.title || 'Accessibility Quiz',
      description:
        parsed.description || 'Test your understanding of accessibility issues',
      questions,
      topics,
      totalPoints,
      estimatedTime,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Validate question type
   */
  private static validateQuestionType(
    type: string
  ): 'mcq' | 'code' | 'true-false' | 'scenario' {
    const validTypes = ['mcq', 'code', 'true-false', 'scenario'];
    return validTypes.includes(type) ? (type as any) : 'mcq';
  }

  /**
   * Evaluate quiz submission
   */
  static async evaluateQuiz(
    quiz: Quiz,
    submissions: QuizSubmission[]
  ): Promise<QuizResult> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback to basic evaluation without AI
      return this.basicEvaluateQuiz(quiz, submissions);
    }

    try {
      return await this.aiEvaluateQuiz(quiz, submissions, apiKey);
    } catch (error) {
      console.error('AI evaluation error:', error);
      // Fallback to basic evaluation
      return this.basicEvaluateQuiz(quiz, submissions);
    }
  }

  /**
   * AI-powered evaluation with partial scoring and explanations
   */
  private static async aiEvaluateQuiz(
    quiz: Quiz,
    submissions: QuizSubmission[],
    apiKey: string
  ): Promise<QuizResult> {
    const prompt = this.buildEvaluationPrompt(quiz, submissions);

    const response = await fetch(this.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert accessibility educator evaluating quiz answers. Provide partial credit for partially correct answers, especially for code questions. Give constructive feedback and link answers back to training concepts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error('AI evaluation failed');
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    try {
      const parsed = JSON.parse(content);
      return this.parseEvaluationResponse(quiz, submissions, parsed);
    } catch (parseError) {
      throw new Error('Failed to parse evaluation response');
    }
  }

  /**
   * Build evaluation prompt
   */
  private static buildEvaluationPrompt(
    quiz: Quiz,
    submissions: QuizSubmission[]
  ): string {
    const questionsWithAnswers = quiz.questions.map(q => {
      const submission = submissions.find(s => s.questionId === q.id);
      return {
        question: q.question,
        type: q.type,
        correctAnswer: q.correctAnswer,
        userAnswer: submission?.answer || '',
        topic: q.topic,
        points: q.points,
        codeSnippet: q.codeSnippet,
        scenario: q.scenario,
      };
    });

    return `Evaluate the following quiz answers. Provide partial credit for code questions if the answer is partially correct.

Quiz Questions and Answers:
${JSON.stringify(questionsWithAnswers, null, 2)}

For each answer, provide:
1. isCorrect: boolean (true if fully correct, false otherwise)
2. pointsEarned: number (0 to points, can be partial for code questions)
3. explanation: string (explain why the answer is correct/incorrect, provide learning feedback)
4. If incorrect, suggest what training module to review

Return in JSON format:
{
  "answers": [
    {
      "questionId": "q1",
      "isCorrect": true,
      "pointsEarned": 10,
      "explanation": "Explanation here"
    }
  ],
  "topicsToReview": ["topic1", "topic2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;
  }

  /**
   * Parse evaluation response
   */
  private static parseEvaluationResponse(
    quiz: Quiz,
    submissions: QuizSubmission[],
    parsed: any
  ): QuizResult {
    const answers = quiz.questions.map(q => {
      const submission = submissions.find(s => s.questionId === q.id);
      const evaluated = parsed.answers?.find((a: any) => a.questionId === q.id);

      const isCorrect =
        evaluated?.isCorrect !== undefined
          ? evaluated.isCorrect
          : this.isAnswerCorrect(q, submission?.answer || '');

      const pointsEarned =
        evaluated?.pointsEarned ?? (isCorrect ? q.points : 0);

      return {
        questionId: q.id,
        question: q.question,
        userAnswer: submission?.answer || '',
        correctAnswer: q.correctAnswer,
        isCorrect,
        pointsEarned,
        pointsPossible: q.points,
        explanation:
          evaluated?.explanation ||
          (isCorrect
            ? 'Correct! ' + q.explanation
            : `Incorrect. ${q.explanation}`),
        topic: q.topic,
      };
    });

    const score = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const totalPoints = quiz.totalPoints;
    const percentage = Math.round((score / totalPoints) * 100);

    const topicsToReview =
      parsed.topicsToReview ||
      answers
        .filter(a => !a.isCorrect)
        .map(a => a.topic)
        .filter((v, i, a) => a.indexOf(v) === i); // Unique topics

    const recommendations =
      parsed.recommendations ||
      (percentage < 70
        ? [
            'Review the accessibility topics where you scored lower',
            'Practice with more code examples',
            'Read the WCAG guidelines for the topics you missed',
          ]
        : [
            'Great job! Continue practicing to maintain your knowledge',
            'Consider exploring advanced accessibility topics',
          ]);

    return {
      score,
      totalPoints,
      percentage,
      answers,
      topicsToReview,
      recommendations,
    };
  }

  /**
   * Basic evaluation without AI (fallback)
   */
  private static basicEvaluateQuiz(
    quiz: Quiz,
    submissions: QuizSubmission[]
  ): QuizResult {
    const answers = quiz.questions.map(q => {
      const submission = submissions.find(s => s.questionId === q.id);
      const isCorrect = this.isAnswerCorrect(q, submission?.answer || '');

      return {
        questionId: q.id,
        question: q.question,
        userAnswer: submission?.answer || '',
        correctAnswer: q.correctAnswer,
        isCorrect,
        pointsEarned: isCorrect ? q.points : 0,
        pointsPossible: q.points,
        explanation: isCorrect
          ? 'Correct! ' + q.explanation
          : `Incorrect. ${q.explanation}`,
        topic: q.topic,
      };
    });

    const score = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const totalPoints = quiz.totalPoints;
    const percentage = Math.round((score / totalPoints) * 100);

    const topicsToReview = answers
      .filter(a => !a.isCorrect)
      .map(a => a.topic)
      .filter((v, i, a) => a.indexOf(v) === i);

    const recommendations =
      percentage < 70
        ? [
            'Review the accessibility topics where you scored lower',
            'Practice with more code examples',
          ]
        : ['Great job! Continue practicing to maintain your knowledge'];

    return {
      score,
      totalPoints,
      percentage,
      answers,
      topicsToReview,
      recommendations,
    };
  }

  /**
   * Check if answer is correct
   */
  private static isAnswerCorrect(
    question: QuizQuestion,
    userAnswer: string
  ): boolean {
    if (!userAnswer) return false;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];

    return correctAnswer.some(correct => {
      const normalizedCorrect = String(correct).trim().toLowerCase();
      return normalizedUserAnswer === normalizedCorrect;
    });
  }
}
