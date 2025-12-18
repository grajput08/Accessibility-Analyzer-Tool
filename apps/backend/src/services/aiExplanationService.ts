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
  private static readonly FALLBACK_ENABLED = true;

  /**
   * Generate an AI explanation for an accessibility issue
   */
  static async explainIssue(
    issue: Pa11yIssue
  ): Promise<IssueExplanationResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key is provided, return a fallback explanation
    if (!apiKey) {
      return this.generateFallbackExplanation(issue);
    }

    try {
      const explanation = await this.generateAIExplanation(issue, apiKey);
      return explanation;
    } catch (error) {
      console.error('AI explanation error:', error);
      // Fallback to rule-based explanation if AI fails
      if (this.FALLBACK_ENABLED) {
        return this.generateFallbackExplanation(issue);
      }
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
      // If JSON parsing fails, try to extract from text
      return this.extractExplanationFromText(content, issue);
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
        : 'No action required';

    // Build explanation from title and explanation
    const title = parsed.title || 'Accessibility Issue';
    const explanationText =
      parsed.explanation ||
      `This issue (${issue.code}) needs attention: ${issue.message}`;

    // Combine title and explanation for the main explanation field
    const fullExplanation = `${title}\n\n${explanationText}${
      parsed.problemReasoning
        ? `\n\nIs this a problem? ${parsed.problemReasoning}`
        : ''
    }${parsed.developerNote ? `\n\nDeveloper note: ${parsed.developerNote}` : ''}`;

    // Map verdict to severity
    const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> =
      {
        fail: issue.type === 'error' ? 'high' : 'medium',
        warning: 'medium',
        pass: 'low',
      };
    const severity = severityMap[verdict] || 'medium';

    // Build WCAG guideline string
    const wcagCriterion = parsed.wcag?.criterion || issue.code || '';
    const wcagName = parsed.wcag?.name || '';
    const wcagGuideline = wcagCriterion
      ? `WCAG 2.1 – ${wcagCriterion} ${wcagName}`.trim()
      : issue.code || 'WCAG 2.1';

    // Build impact based on verdict and problem status
    let impact = '';
    if (!isProblem) {
      impact = `This is not a problem. ${parsed.problemReasoning || 'The element is properly configured for accessibility.'}`;
    } else {
      impact = `This ${issue.type} affects users with disabilities: ${issue.message}. ${explanationText}`;
    }

    // Generate suggestions
    const suggestions: Suggestion[] = [];
    if (parsed.developerNote) {
      suggestions.push({
        title: 'Best Practice',
        description: parsed.developerNote,
        priority: severity === 'high' ? 'high' : 'medium',
      });
    }

    // Add fix suggestion if required
    if (
      solutionRequired &&
      solutionCode &&
      solutionCode !== 'No action required'
    ) {
      suggestions.push({
        title: 'Recommended Fix',
        description: `Apply the following fix to resolve this accessibility issue.`,
        priority: 'high',
        example: solutionCode,
      });
    }

    // If no suggestions, add default ones
    if (suggestions.length === 0) {
      suggestions.push({
        title: 'Review Implementation',
        description:
          'Review the element and ensure it follows WCAG guidelines.',
        priority: 'medium',
      });
    }

    // Build code fixes
    const codeFixes: CodeFix[] = [];
    if (
      solutionRequired &&
      solutionCode &&
      solutionCode !== 'No action required'
    ) {
      codeFixes.push({
        description: 'Recommended fix',
        beforeCode: issue.context || '',
        afterCode: solutionCode,
        explanation:
          parsed.developerNote || 'This fix addresses the accessibility issue.',
      });
    } else if (issue.context) {
      // Even if no fix is required, show the code for reference
      codeFixes.push({
        description: 'Current implementation (no changes needed)',
        beforeCode: issue.context,
        afterCode: issue.context,
        explanation:
          parsed.problemReasoning ||
          'This implementation is already accessible.',
      });
    }

    return {
      explanation: fullExplanation,
      fix:
        solutionRequired && solutionCode !== 'No action required'
          ? solutionCode
          : issue.context || '',
      details: {
        impact,
        wcagGuideline,
        affectedUsers: this.getDefaultAffectedUsers(issue),
        severity,
      },
      suggestions,
      codeFixes:
        codeFixes.length > 0
          ? codeFixes
          : this.validateAndEnhanceCodeFixes([], issue, solutionCode),
    };
  }

  /**
   * Parse the old format response (for backward compatibility)
   */
  private static parseOldFormatResponse(
    parsed: any,
    issue: Pa11yIssue
  ): IssueExplanationResponse {
    // Validate that we have meaningful AI-generated content
    const hasValidExplanation =
      parsed.explanation &&
      parsed.explanation.length > 20 &&
      parsed.explanation !== 'Unable to generate explanation.';

    const hasValidFix =
      parsed.fix && parsed.fix.length > 0 && parsed.fix !== issue.context;

    // Ensure we have at least basic structure
    const explanation: IssueExplanationResponse = {
      explanation: hasValidExplanation
        ? parsed.explanation
        : `This ${issue.type} (${issue.code}) needs attention: ${issue.message}`,
      fix: hasValidFix ? parsed.fix : issue.context || '',
      details:
        parsed.details && typeof parsed.details === 'object'
          ? {
              impact:
                parsed.details.impact ||
                `This ${issue.type} affects users with disabilities: ${issue.message}`,
              wcagGuideline:
                parsed.details.wcagGuideline || issue.code || 'WCAG 2.1',
              affectedUsers:
                Array.isArray(parsed.details.affectedUsers) &&
                parsed.details.affectedUsers.length > 0
                  ? parsed.details.affectedUsers
                  : this.getDefaultAffectedUsers(issue),
              severity: ['critical', 'high', 'medium', 'low'].includes(
                parsed.details.severity
              )
                ? parsed.details.severity
                : issue.type === 'error'
                  ? 'high'
                  : issue.type === 'warning'
                    ? 'medium'
                    : 'low',
            }
          : {
              impact: `This ${issue.type} affects users with disabilities: ${issue.message}`,
              wcagGuideline: issue.code || 'WCAG 2.1',
              affectedUsers: this.getDefaultAffectedUsers(issue),
              severity:
                issue.type === 'error'
                  ? 'high'
                  : issue.type === 'warning'
                    ? 'medium'
                    : 'low',
            },
      suggestions:
        Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
          ? parsed.suggestions.filter(
              (s: any) => s && s.title && s.description && s.priority
            )
          : this.generateDefaultSuggestions(issue),
      codeFixes: this.validateAndEnhanceCodeFixes(
        parsed.codeFixes,
        issue,
        parsed.fix
      ),
    };

    return explanation;
  }

  /**
   * Get default affected users based on issue type
   */
  private static getDefaultAffectedUsers(issue: Pa11yIssue): string[] {
    const code = issue.code.toLowerCase();
    const message = issue.message.toLowerCase();

    if (
      code.includes('h30') ||
      message.includes('alt') ||
      message.includes('image')
    ) {
      return ['Screen reader users', 'Users with slow connections'];
    }
    if (code.includes('g18') || message.includes('contrast')) {
      return ['Users with low vision', 'Users with color blindness'];
    }
    if (
      code.includes('label') ||
      message.includes('form') ||
      message.includes('input')
    ) {
      return ['Screen reader users', 'Users with cognitive disabilities'];
    }
    if (code.includes('heading') || message.includes('heading')) {
      return ['Screen reader users', 'Keyboard-only users'];
    }

    return ['Users with disabilities'];
  }

  /**
   * Validate and enhance code fixes to ensure uniqueness
   */
  private static validateAndEnhanceCodeFixes(
    codeFixes: any,
    issue: Pa11yIssue,
    aiFix: string
  ): CodeFix[] {
    const context = issue.context || '';

    // If AI provided valid codeFixes, use them
    if (Array.isArray(codeFixes) && codeFixes.length > 0) {
      return codeFixes
        .filter(
          (fix: any) =>
            fix && fix.beforeCode && fix.afterCode && fix.description
        )
        .map((fix: any) => ({
          description: fix.description || 'Fix for this issue',
          beforeCode: fix.beforeCode || context,
          afterCode: fix.afterCode || aiFix || context,
          explanation:
            fix.explanation || 'This fix addresses the accessibility issue.',
        }));
    }

    // If AI provided a fix but no codeFixes array, create one
    if (aiFix && aiFix !== context && context) {
      return [
        {
          description: `Fix for ${issue.code}: ${issue.message}`,
          beforeCode: context,
          afterCode: aiFix,
          explanation: `This fix addresses the ${issue.code} issue by modifying the element to meet accessibility requirements.`,
        },
      ];
    }

    // Last resort: create a generic fix (but this should rarely happen)
    return [
      {
        description: `Recommended fix for ${issue.code}`,
        beforeCode: context || 'Original code',
        afterCode: context || 'Fixed code',
        explanation: `Please review the ${issue.code} guideline and apply the appropriate fix.`,
      },
    ];
  }

  /**
   * Generate default suggestions if AI doesn't provide them
   */
  private static generateDefaultSuggestions(issue: Pa11yIssue): Suggestion[] {
    const code = issue.code.toLowerCase();
    const message = issue.message.toLowerCase();
    const context = issue.context || '';

    const suggestions: Suggestion[] = [];

    // Issue-specific suggestions based on code and context
    if (
      code.includes('h30') ||
      message.includes('alt') ||
      message.includes('image')
    ) {
      suggestions.push({
        title: 'Add descriptive alt text',
        description: `For the image element "${context.substring(0, 50)}...", provide meaningful alternative text that describes the image content and purpose.`,
        priority: 'high',
        example: context.includes('<img')
          ? context.replace(/alt=["'][^"']*["']?/i, 'alt="Descriptive text"')
          : undefined,
      });
    } else if (code.includes('g18') || message.includes('contrast')) {
      suggestions.push({
        title: 'Increase color contrast ratio',
        description: `The element "${context.substring(0, 50)}..." needs better contrast. Ensure text has at least 4.5:1 contrast ratio for normal text.`,
        priority: 'high',
      });
    } else if (
      code.includes('label') ||
      message.includes('form') ||
      message.includes('input')
    ) {
      suggestions.push({
        title: 'Associate label with input',
        description: `The form element "${context.substring(0, 50)}..." needs an associated label for accessibility.`,
        priority: 'high',
      });
    } else {
      suggestions.push({
        title: `Fix ${issue.code} issue`,
        description: `Address the ${issue.code} issue: ${issue.message}. Review the specific element and apply the appropriate fix.`,
        priority: 'high',
      });
    }

    // Always include testing suggestion
    suggestions.push({
      title: 'Test with Assistive Technologies',
      description: `After fixing this ${issue.code} issue, test with screen readers and keyboard navigation to ensure it works correctly.`,
      priority: 'medium',
    });

    return suggestions;
  }

  /**
   * Extract explanation from text response if JSON parsing fails
   */
  private static extractExplanationFromText(
    text: string,
    issue: Pa11yIssue
  ): IssueExplanationResponse {
    // Try to find explanation and fix in the text
    const explanationMatch =
      text.match(/"explanation"\s*:\s*"([^"]+)"/i) ||
      text.match(/explanation["']?\s*[:=]\s*["']?([^"'\n]+)/i);

    const fixMatch =
      text.match(/"fix"\s*:\s*"([^"]+)"/i) ||
      text.match(/fix["']?\s*[:=]\s*["']?([^"'\n]+)/i) ||
      text.match(/<[^>]+>/); // Try to find any HTML tag

    return {
      explanation: explanationMatch?.[1] || 'Unable to generate explanation.',
      fix: fixMatch?.[1] || issue.context || '',
      details: {
        impact:
          'This accessibility issue may prevent users with disabilities from accessing or understanding the content.',
        wcagGuideline: issue.code || 'WCAG 2.1',
        affectedUsers: ['Users with disabilities'],
        severity:
          issue.type === 'error'
            ? 'high'
            : issue.type === 'warning'
              ? 'medium'
              : 'low',
      },
      suggestions: this.generateDefaultSuggestions(issue),
      codeFixes: [
        {
          description: 'Recommended fix',
          beforeCode: issue.context || '',
          afterCode: fixMatch?.[1] || issue.context || '',
          explanation: 'This fix addresses the accessibility issue.',
        },
      ],
    };
  }

  /**
   * Generate fallback explanation when AI is not available
   */
  private static generateFallbackExplanation(
    issue: Pa11yIssue
  ): IssueExplanationResponse {
    // Rule-based explanations for common issues
    const code = issue.code.toLowerCase();
    const message = issue.message.toLowerCase();
    const context = issue.context || '';

    // Missing alt attribute
    if (
      code.includes('h30') ||
      message.includes('alt') ||
      message.includes('alternative')
    ) {
      const fixedCode = this.fixMissingAlt(context);
      return {
        explanation:
          'This image does not have alternative text, so screen reader users cannot understand what the image represents.',
        fix: fixedCode,
        details: {
          impact:
            'Screen reader users will not know what information the image conveys, making the content inaccessible to them.',
          wcagGuideline: 'WCAG 2.1 Level A - 1.1.1 Non-text Content',
          affectedUsers: ['Screen reader users', 'Users with slow connections'],
          severity: 'high',
        },
        suggestions: [
          {
            title: 'Add descriptive alt text',
            description:
              'Provide meaningful alternative text that describes the image content and purpose. For decorative images, use an empty alt attribute.',
            priority: 'high',
            example: 'alt="A red bicycle parked outside a building"',
          },
          {
            title: 'Use empty alt for decorative images',
            description:
              'If the image is purely decorative and doesn\'t convey information, use alt="" to hide it from screen readers.',
            priority: 'medium',
          },
        ],
        codeFixes: [
          {
            description: 'Add alt attribute with descriptive text',
            beforeCode: context || '<img src="image.jpg">',
            afterCode: fixedCode,
            explanation:
              'The alt attribute provides text alternatives that screen readers can announce to users.',
          },
        ],
      };
    }

    // Color contrast issues
    if (code.includes('g18') || message.includes('contrast')) {
      return {
        explanation:
          'The text color contrast ratio is insufficient, making it difficult for users with low vision to read the content.',
        fix: 'Adjust text and background colors to meet WCAG contrast requirements (4.5:1 for normal text, 3:1 for large text).',
        details: {
          impact:
            'Users with low vision, color blindness, or those using devices in bright sunlight may struggle to read the text.',
          wcagGuideline: 'WCAG 2.1 Level AA - 1.4.3 Contrast (Minimum)',
          affectedUsers: [
            'Users with low vision',
            'Users with color blindness',
            'Users in bright environments',
          ],
          severity: 'high',
        },
        suggestions: [
          {
            title: 'Increase color contrast ratio',
            description:
              'Ensure text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold) against the background.',
            priority: 'high',
          },
          {
            title: 'Use contrast checking tools',
            description:
              'Use tools like WebAIM Contrast Checker to verify your color combinations meet WCAG requirements.',
            priority: 'medium',
          },
        ],
        codeFixes: [
          {
            description: 'Update CSS to improve contrast',
            beforeCode:
              context || '<p style="color: #ccc;">Low contrast text</p>',
            afterCode:
              context.replace(/#[0-9a-fA-F]{3,6}/g, '#000000') ||
              '<p style="color: #000;">High contrast text</p>',
            explanation:
              'Use darker text colors on light backgrounds or lighter text on dark backgrounds to achieve sufficient contrast.',
          },
        ],
      };
    }

    // Missing labels
    if (code.includes('label') || message.includes('label')) {
      const fixedCode = this.fixMissingLabel(context);
      return {
        explanation:
          'This form element is missing a label, so screen reader users cannot understand what input is expected.',
        fix: fixedCode,
        details: {
          impact:
            'Screen reader users cannot identify what information should be entered in the form field, making forms unusable.',
          wcagGuideline: 'WCAG 2.1 Level A - 3.3.2 Labels or Instructions',
          affectedUsers: [
            'Screen reader users',
            'Users with cognitive disabilities',
          ],
          severity: 'high',
        },
        suggestions: [
          {
            title: 'Associate labels with inputs',
            description:
              'Use the <label> element with the "for" attribute matching the input\'s "id", or wrap the input inside the label.',
            priority: 'high',
          },
          {
            title: 'Use aria-label as fallback',
            description:
              "If visual design doesn't allow a visible label, use aria-label or aria-labelledby to provide an accessible name.",
            priority: 'medium',
          },
        ],
        codeFixes: [
          {
            description: 'Add associated label element',
            beforeCode: context || '<input type="text">',
            afterCode: fixedCode,
            explanation:
              'Labels provide visible text and programmatic association that screen readers can announce.',
          },
        ],
      };
    }

    // Heading structure
    if (code.includes('heading') || message.includes('heading')) {
      return {
        explanation:
          'The heading structure is incorrect, which makes it difficult for screen reader users to navigate the page content.',
        fix: 'Ensure headings follow a logical hierarchy (h1, h2, h3, etc.) without skipping levels.',
        details: {
          impact:
            'Screen reader users rely on headings to navigate pages. Incorrect structure makes content navigation confusing and inefficient.',
          wcagGuideline: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships',
          affectedUsers: ['Screen reader users', 'Keyboard-only users'],
          severity: 'medium',
        },
        suggestions: [
          {
            title: 'Maintain logical heading order',
            description:
              'Start with h1, then h2, then h3, etc. Do not skip heading levels (e.g., h1 to h3). Each page should have only one h1.',
            priority: 'high',
          },
          {
            title: 'Use headings for structure, not styling',
            description:
              'Choose heading levels based on content hierarchy, not visual appearance. Use CSS for styling instead.',
            priority: 'medium',
          },
        ],
        codeFixes: [
          {
            description: 'Correct heading hierarchy',
            beforeCode: context || '<h1>Title</h1><h3>Subtitle</h3>',
            afterCode:
              context.replace(/<h3>/g, '<h2>').replace(/<\/h3>/g, '</h2>') ||
              '<h1>Title</h1><h2>Subtitle</h2>',
            explanation:
              'Heading levels should follow a logical sequence without skipping levels.',
          },
        ],
      };
    }

    // Generic fallback
    return {
      explanation: `This accessibility issue (${issue.code}) may affect users with disabilities. ${issue.message}`,
      fix:
        context ||
        'Review the HTML structure and ensure it follows accessibility best practices.',
      details: {
        impact:
          'This issue may prevent users with disabilities from accessing or understanding the content.',
        wcagGuideline: issue.code || 'WCAG 2.1',
        affectedUsers: ['Users with disabilities'],
        severity:
          issue.type === 'error'
            ? 'high'
            : issue.type === 'warning'
              ? 'medium'
              : 'low',
      },
      suggestions: [
        {
          title: 'Review WCAG guidelines',
          description: `Review the ${issue.code} guideline to understand the requirement.`,
          priority: 'high',
        },
        {
          title: 'Test with assistive technologies',
          description:
            'Test your implementation with screen readers and other assistive technologies.',
          priority: 'medium',
        },
      ],
      codeFixes: [
        {
          description: 'Review and fix the issue',
          beforeCode: context || '',
          afterCode: context || '',
          explanation:
            'Please review the accessibility guidelines for this specific issue.',
        },
      ],
    };
  }

  /**
   * Fix missing alt attribute
   */
  private static fixMissingAlt(html: string): string {
    if (!html) return '<img src="..." alt="Description of image">';

    // Extract src from img tag
    const srcMatch = html.match(/src=["']([^"']+)["']/i);
    const src = srcMatch?.[1] || '...';

    // Try to extract any existing class/id for context
    const classMatch = html.match(/class=["']([^"']+)["']/i);
    const classAttr = classMatch ? ` class="${classMatch[1]}"` : '';

    // Generate descriptive alt text suggestion based on context
    let altText = 'Description of image';

    // Check class name
    if (classMatch?.[1]) {
      const className = classMatch[1].toLowerCase();
      if (className.includes('logo')) altText = 'Company logo';
      else if (className.includes('icon')) altText = 'Icon';
      else if (className.includes('photo')) altText = 'Photo';
      else if (className.includes('image')) altText = 'Image';
    }

    // Check src filename for common patterns
    if (src && altText === 'Description of image') {
      const srcLower = src.toLowerCase();
      if (srcLower.includes('logo')) altText = 'Company logo';
      else if (srcLower.includes('icon')) altText = 'Icon';
      else if (srcLower.includes('photo') || srcLower.includes('image'))
        altText = 'Image';
    }

    return `<img src="${src}" alt="${altText}"${classAttr}>`;
  }

  /**
   * Fix missing label
   */
  private static fixMissingLabel(html: string): string {
    if (!html)
      return '<label for="input-id">Input Label</label>\n<input id="input-id" type="text">';

    // Try to extract input type and id/name
    const typeMatch = html.match(/type=["']([^"']+)["']/i);
    const idMatch = html.match(/id=["']([^"']+)["']/i);
    const nameMatch = html.match(/name=["']([^"']+)["']/i);

    const inputType = typeMatch?.[1] || 'text';
    const inputId = idMatch?.[1] || nameMatch?.[1] || 'input-id';
    const labelText = idMatch?.[1]?.replace(/[-_]/g, ' ') || 'Input Label';

    return `<label for="${inputId}">${labelText.charAt(0).toUpperCase() + labelText.slice(1)}</label>\n<input id="${inputId}" type="${inputType}">`;
  }
}
