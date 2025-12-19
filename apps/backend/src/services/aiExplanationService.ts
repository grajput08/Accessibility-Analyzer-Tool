import fetch from 'node-fetch';
import {
  Pa11yIssue,
  IssueExplanationResponse,
  CodeFix,
  Suggestion,
} from '../types/accessibility';

export class AIExplanationService {
  private static readonly OPENAI_API_URL =
    'https://api.openai.com/v1/chat/completions';
  private static readonly OPENAI_MODEL = 'gpt-4o-mini'; // Using cheaper model for MVP

  /**
   * Generate an AI explanation for an accessibility issue
   */
  static async explainIssue(
    issue: Pa11yIssue
  ): Promise<IssueExplanationResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key is provided, throw an error
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const explanation = await this.generateAIExplanation(issue, apiKey);
      return explanation;
    } catch (error) {
      console.error('AI explanation error:', error);
      throw new Error(
        `Failed to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate explanation using OpenAI API
   */
  private static async generateAIExplanation(
    issue: Pa11yIssue,
    apiKey: string
  ): Promise<IssueExplanationResponse> {
    const prompt = this.buildPrompt(issue);

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
              'You are an expert WCAG 2.1 / 2.2 accessibility auditor.\n\nYou analyze accessibility issues detected by automated tools (Pa11y, axe, Lighthouse).\nYou clearly classify findings as Pass, Warning, or Fail.\nYou explain issues in simple language for frontend developers.\nYou always prefer semantic HTML and avoid unnecessary ARIA.\nYou provide minimal, standards-compliant fixes only when required.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
      return this.parseAIResponse(parsed, issue);
    } catch (parseError) {
      // If JSON parsing fails, throw error
      throw new Error(
        `Failed to parse OpenAI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
      );
    }
  }

  /**
   * Build prompt for AI model
   */
  private static buildPrompt(issue: Pa11yIssue): string {
    const htmlContext = issue.context || 'N/A';

    // Build context information by analyzing the HTML
    const contextInfo: string[] = [];

    // Check if element is inside a link
    if (htmlContext.includes('<a') || htmlContext.includes('</a>')) {
      contextInfo.push('The element is inside a clickable link (<a>)');
    }

    // Check if element is inside or is a button
    if (htmlContext.includes('<button') || htmlContext.includes('</button>')) {
      contextInfo.push('The element is inside or is a button');
    }

    // Check if there's visible text in the link/parent
    const textMatch = htmlContext.match(/>([^<]+)</);
    if (textMatch && textMatch[1].trim()) {
      contextInfo.push('The link also contains visible text');
    }

    // Check if image has empty alt
    if (
      htmlContext.includes('alt=""') ||
      htmlContext.match(/alt\s*=\s*["']\s*["']/)
    ) {
      contextInfo.push('The image uses an empty alt attribute');
    }

    const contextString =
      contextInfo.length > 0
        ? contextInfo.map(c => `- ${c}`).join('\n')
        : '- No additional context provided';

    return `Analyze the following accessibility issue and generate a solution for the end user.

Issue message:
"${issue.message}"

HTML snippet:
\`\`\`html
${htmlContext}
\`\`\`

Context:
${contextString}

Provide the response in the following structured format ONLY as valid JSON:

{
  "title": "Short, clear issue title",
  "verdict": "Pass | Warning | Fail",
  "wcag": {
    "criterion": "Include success criterion number (e.g., '1.1.1')",
    "name": "Include success criterion name (e.g., 'Non-text Content')"
  },
  "explanation": "Explain in simple terms why this happens (1-2 sentences)",
  "isProblem": true | false,
  "problemReasoning": "One-line reasoning if isProblem is true, otherwise explain why it's not a problem",
  "solution": {
    "required": true | false,
    "code": "If required is true, show the corrected HTML code. If false, say 'No action required'"
  },
  "developerNote": "One short tip or best practice"
}

IMPORTANT:
- Analyze the SPECIFIC HTML code provided above
- Reference actual attributes, content, and context
- If the image/element is decorative and already has accessible text nearby, verdict should be "Pass" and isProblem should be false
- Prefer semantic HTML over ARIA when possible
- Only provide fixes when actually needed
- Ensure all JSON is valid and properly escaped`;
  }

  /**
   * Parse AI response and ensure it has all required fields
   */
  private static parseAIResponse(
    parsed: any,
    issue: Pa11yIssue
  ): IssueExplanationResponse {
    // Check if this is the new format (has title, verdict, wcag object)
    const isNewFormat =
      parsed.title &&
      parsed.verdict &&
      parsed.wcag &&
      typeof parsed.wcag === 'object';

    if (isNewFormat) {
      return this.parseNewFormatResponse(parsed, issue);
    }

    // Fallback to old format parsing
    return this.parseOldFormatResponse(parsed, issue);
  }

  /**
   * Parse the new structured format response
   */
  private static parseNewFormatResponse(
    parsed: any,
    issue: Pa11yIssue
  ): IssueExplanationResponse {
    const verdict = parsed.verdict?.toLowerCase() || 'warning';
    const isProblem = parsed.isProblem === true;
    const solutionRequired = parsed.solution?.required === true;
    const solutionCode =
      solutionRequired &&
      parsed.solution?.code &&
      parsed.solution.code !== 'No action required'
        ? parsed.solution.code
        : '';

    // Build explanation from title and explanation - only use what OpenAI provided
    const title = parsed.title || '';
    const explanationText = parsed.explanation || '';
    const fullExplanation =
      title && explanationText
        ? `${title}\n\n${explanationText}${parsed.problemReasoning ? `\n\nIs this a problem? ${parsed.problemReasoning}` : ''}${parsed.developerNote ? `\n\nDeveloper note: ${parsed.developerNote}` : ''}`
        : explanationText || title || '';

    // Map verdict to severity
    const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> =
      {
        fail: 'high',
        warning: 'medium',
        pass: 'low',
      };
    const severity = severityMap[verdict] || 'medium';

    // Build WCAG guideline string - only use what OpenAI provided
    const wcagCriterion = parsed.wcag?.criterion || '';
    const wcagName = parsed.wcag?.name || '';
    const wcagGuideline =
      wcagCriterion && wcagName
        ? `WCAG 2.1 – ${wcagCriterion} ${wcagName}`
        : wcagCriterion
          ? `WCAG 2.1 – ${wcagCriterion}`
          : '';

    // Build impact based on verdict and problem status - only use what OpenAI provided
    const impact = parsed.problemReasoning
      ? `This is ${isProblem ? '' : 'not '}a problem. ${parsed.problemReasoning}`
      : explanationText || '';

    // Generate suggestions - only use what OpenAI provided
    const suggestions: Suggestion[] = [];
    if (parsed.developerNote) {
      suggestions.push({
        title: 'Best Practice',
        description: parsed.developerNote,
        priority: severity === 'high' ? 'high' : 'medium',
      });
    }

    if (Array.isArray(parsed.suggestions)) {
      parsed.suggestions.forEach((s: any) => {
        if (s && s.title && s.description && s.priority) {
          suggestions.push({
            title: s.title,
            description: s.description,
            priority: s.priority,
            example: s.example,
          });
        }
      });
    }

    // Build code fixes - only use what OpenAI provided
    const codeFixes: CodeFix[] = [];
    if (
      solutionRequired &&
      solutionCode &&
      solutionCode !== 'No action required'
    ) {
      codeFixes.push({
        description: parsed.solution?.description || 'Recommended fix',
        beforeCode: issue.context || '',
        afterCode: solutionCode,
        explanation: parsed.developerNote || '',
      });
    }

    if (Array.isArray(parsed.codeFixes)) {
      parsed.codeFixes.forEach((fix: any) => {
        if (fix && fix.beforeCode && fix.afterCode && fix.description) {
          codeFixes.push({
            description: fix.description,
            beforeCode: fix.beforeCode,
            afterCode: fix.afterCode,
            explanation: fix.explanation || '',
          });
        }
      });
    }

    return {
      explanation: fullExplanation,
      fix: solutionCode || issue.context || '',
      details: {
        impact: impact || '',
        wcagGuideline: wcagGuideline || '',
        affectedUsers: Array.isArray(parsed.affectedUsers)
          ? parsed.affectedUsers
          : [],
        severity,
      },
      suggestions,
      codeFixes,
    };
  }

  /**
   * Parse the old format response (for backward compatibility)
   */
  private static parseOldFormatResponse(
    parsed: any,
    issue: Pa11yIssue
  ): IssueExplanationResponse {
    // Only use what OpenAI provided, no defaults
    return {
      explanation: parsed.explanation || '',
      fix: parsed.fix || issue.context || '',
      details:
        parsed.details && typeof parsed.details === 'object'
          ? {
              impact: parsed.details.impact || '',
              wcagGuideline: parsed.details.wcagGuideline || '',
              affectedUsers: Array.isArray(parsed.details.affectedUsers)
                ? parsed.details.affectedUsers
                : [],
              severity: ['critical', 'high', 'medium', 'low'].includes(
                parsed.details.severity
              )
                ? parsed.details.severity
                : 'medium',
            }
          : {
              impact: '',
              wcagGuideline: '',
              affectedUsers: [],
              severity: 'medium',
            },
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter(
            (s: any) => s && s.title && s.description && s.priority
          )
        : [],
      codeFixes: Array.isArray(parsed.codeFixes)
        ? parsed.codeFixes.filter(
            (fix: any) =>
              fix && fix.beforeCode && fix.afterCode && fix.description
          )
        : [],
    };
  }
}
