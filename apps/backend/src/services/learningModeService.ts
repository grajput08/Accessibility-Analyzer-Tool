import fetch from 'node-fetch';
import { LearningModeContent, Pa11yIssue } from '../types/accessibility';

/**
 * Learning Mode Service
 * Provides built-in educational content for accessibility issues
 * This service trains teams, not just audits
 */
export class LearningModeService {
  private static readonly OPENAI_API_URL =
    'https://api.openai.com/v1/chat/completions';
  private static readonly OPENAI_MODEL = 'gpt-4o-mini';
  /**
   * Get learning mode content for an issue using OpenAI
   * This generates comprehensive learning content including articles and videos
   */
  static async getLearningContentWithAI(
    issue: Pa11yIssue
  ): Promise<LearningModeContent> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const learningContent = await this.generateAILearningContent(
        issue,
        apiKey
      );
      return learningContent;
    } catch (error) {
      console.error('AI learning content error:', error);
      // Fallback to static content if AI generation fails
      const staticContent = this.getLearningContent(issue.code);
      if (staticContent) {
        return staticContent;
      }
      throw new Error(
        `Failed to generate learning content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate learning content using OpenAI API
   */
  private static async generateAILearningContent(
    issue: Pa11yIssue,
    apiKey: string
  ): Promise<LearningModeContent> {
    const prompt = this.buildLearningPrompt(issue);

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
              'You are an expert accessibility educator specializing in WCAG 2.1/2.2 guidelines. Your role is to help developers understand accessibility issues by providing comprehensive, clear, and actionable educational content. You always provide real, accessible article URLs and YouTube video URLs when suggesting resources.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
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
      return this.parseLearningResponse(parsed);
    } catch (parseError) {
      throw new Error(
        `Failed to parse OpenAI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
      );
    }
  }

  /**
   * Build prompt for learning content generation
   */
  private static buildLearningPrompt(issue: Pa11yIssue): string {
    return `Generate comprehensive learning content for the following accessibility issue. Your response should help developers understand why this issue matters, what WCAG guidelines apply, and how to test it manually.

Accessibility Issue:
- Code: ${issue.code}
- Message: ${issue.message}
- Context: ${issue.context || 'N/A'}
- Type: ${issue.type}

Provide the response in the following JSON format:

{
  "whyItMatters": "A clear, detailed explanation (2-3 paragraphs) of why this accessibility issue matters. Explain the impact on users, particularly those using assistive technologies. Be specific about how this barrier affects real users.",
  "wcagGuideline": "Detailed WCAG guideline information including the specific success criterion number and name (e.g., 'WCAG 2.1 Success Criterion 1.1.1 (Level A): Non-text Content'). Include the level (A, AA, or AAA) and provide context about what the guideline requires.",
  "howToTestManually": "Step-by-step instructions (numbered list) on how to manually test this issue. Include multiple testing methods such as screen reader testing, keyboard navigation, browser DevTools inspection, and visual inspection. Make it actionable for developers.",
  "articleLinks": [
    {
      "title": "Article title",
      "url": "Full URL to the article (must be a real, accessible article from reputable sources like MDN, WebAIM, W3C, A11Y Project, etc.)",
      "description": "Brief description of what the article covers"
    }
  ],
  "youtubeVideoLinks": [
    {
      "title": "Video title",
      "url": "Full YouTube URL starting with https://www.youtube.com/watch?v=, https://youtu.be/, or https://www.youtube.com/playlist?list= (must be a real, accessible YouTube video or playlist)",
      "description": "Brief description of what the video teaches"
    }
  ]
}

IMPORTANT REQUIREMENTS:
- Provide 1-2 high-quality article links from reputable sources (MDN Web Docs, WebAIM, W3C WAI, A11y Wins, etc.)
- DO NOT include articles from https://www.a11yproject.com/ - exclude this domain from recommendations
- All URLs must be real and accessible (do not make up URLs)
- YouTube URLs must be in the format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
- YouTube playlist URLs are also acceptable: https://www.youtube.com/playlist?list=PLAYLIST_ID
- All URLs must start with http:// or https://
- Highly recommended article resources (prioritize these when relevant):
  * https://www.w3.org/WAI/ARIA/apg/ - ARIA Authoring Practices Guide (excellent for ARIA patterns and widgets)
- Suggested YouTube videos for accessibility education (use when relevant):
  * https://www.youtube.com/watch?v=pIvX0J6_3GU
  * https://www.youtube.com/watch?v=UaRAXFT_rwk
  * https://www.youtube.com/watch?v=RjpvOqZigao
  * https://www.youtube.com/watch?v=NEK3aMPs1Us
  * https://www.youtube.com/watch?v=e2nkq3h1P68
  * https://www.youtube.com/playlist?list=PLsvet3tE97XcMTCT6U_tZKkGYIn0qeRuD
  * https://www.youtube.com/playlist?list=PLsvet3tE97XetxAvwTeG8ttKggrbG6Tm1
- Focus on educational content that helps developers learn and understand
- Make the content practical and actionable
- Use clear, developer-friendly language
- Ensure all JSON is valid and properly formatted`;
  }

  /**
   * Validate and normalize YouTube URL
   */
  private static isValidYouTubeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    // Must start with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }

    // Check for YouTube domain patterns (including playlists and UTM parameters)
    const youtubePatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/i, // Standard watch URL
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+(&.*)?$/i, // With additional parameters (UTM, etc.)
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/i, // Embed URL
      /^https?:\/\/youtu\.be\/[\w-]+/i, // Short URL
      /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/i, // Old format
      /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+/i, // Playlist URL
    ];

    return youtubePatterns.some(pattern => pattern.test(url));
  }

  /**
   * Parse AI response into LearningModeContent
   */
  private static parseLearningResponse(parsed: any): LearningModeContent {
    return {
      whyItMatters: parsed.whyItMatters || '',
      wcagGuideline: parsed.wcagGuideline || '',
      howToTestManually: parsed.howToTestManually || '',
      articleLinks: Array.isArray(parsed.articleLinks)
        ? parsed.articleLinks.filter(
            (link: any) =>
              link &&
              link.title &&
              link.url &&
              (link.url.startsWith('http://') ||
                link.url.startsWith('https://')) &&
              !link.url.includes('a11yproject.com') // Exclude a11yproject.com
          )
        : [],
      youtubeVideoLinks: Array.isArray(parsed.youtubeVideoLinks)
        ? parsed.youtubeVideoLinks.filter(
            (video: any) =>
              video &&
              video.title &&
              video.url &&
              this.isValidYouTubeUrl(video.url)
          )
        : [],
    };
  }

  /**
   * Get learning mode content for an issue code (static database fallback)
   */
  static getLearningContent(code: string): LearningModeContent | null {
    // Normalize the code (remove common prefixes, convert to lowercase)
    const normalizedCode = code.toLowerCase().trim();

    // Try exact match first
    if (this.learningDatabase[normalizedCode]) {
      return this.learningDatabase[normalizedCode];
    }

    // Try partial match for common patterns
    for (const [key, value] of Object.entries(this.learningDatabase)) {
      if (normalizedCode.includes(key) || key.includes(normalizedCode)) {
        return value;
      }
    }

    // Match by WCAG criterion numbers (e.g., 1_4_3, 1.4.3, 1-4-3)
    // WCAG 1.1.1 - Non-text Content (Images)
    if (
      normalizedCode.includes('1_1_1') ||
      normalizedCode.includes('1.1.1') ||
      normalizedCode.includes('1-1-1') ||
      normalizedCode.match(/principle1[._-]guideline1[._-]1[._-]1/)
    ) {
      return this.learningDatabase['image-alt'] || null;
    }

    // WCAG 1.3.1 - Info and Relationships (Headings, Forms)
    if (
      normalizedCode.includes('1_3_1') ||
      normalizedCode.includes('1.3.1') ||
      normalizedCode.includes('1-3-1') ||
      normalizedCode.match(/principle1[._-]guideline1[._-]3[._-]1/)
    ) {
      // Check if it's more likely a heading or form issue
      if (
        normalizedCode.includes('heading') ||
        normalizedCode.includes('h1') ||
        normalizedCode.includes('h2') ||
        normalizedCode.includes('h3')
      ) {
        return this.learningDatabase['heading-order'] || null;
      }
      if (
        normalizedCode.includes('form') ||
        normalizedCode.includes('label') ||
        normalizedCode.includes('input')
      ) {
        return this.learningDatabase['form-label'] || null;
      }
      // Default to heading-order for 1.3.1
      return this.learningDatabase['heading-order'] || null;
    }

    // WCAG 1.4.3 - Contrast (Minimum)
    if (
      normalizedCode.includes('1_4_3') ||
      normalizedCode.includes('1.4.3') ||
      normalizedCode.includes('1-4-3') ||
      normalizedCode.match(/principle1[._-]guideline1[._-]4[._-]3/) ||
      normalizedCode.includes('g18') // G18 is a contrast technique
    ) {
      return this.learningDatabase['color-contrast'] || null;
    }

    // WCAG 2.1.1 - Keyboard
    if (
      normalizedCode.includes('2_1_1') ||
      normalizedCode.includes('2.1.1') ||
      normalizedCode.includes('2-1-1') ||
      normalizedCode.match(/principle2[._-]guideline2[._-]1[._-]1/)
    ) {
      return this.learningDatabase['keyboard-access'] || null;
    }

    // WCAG 2.4.4 - Link Purpose
    if (
      normalizedCode.includes('2_4_4') ||
      normalizedCode.includes('2.4.4') ||
      normalizedCode.includes('2-4-4') ||
      normalizedCode.match(/principle2[._-]guideline2[._-]4[._-]4/)
    ) {
      return this.learningDatabase['link-name'] || null;
    }

    // WCAG 2.4.7 - Focus Visible
    if (
      normalizedCode.includes('2_4_7') ||
      normalizedCode.includes('2.4.7') ||
      normalizedCode.includes('2-4-7') ||
      normalizedCode.match(/principle2[._-]guideline2[._-]4[._-]7/)
    ) {
      return this.learningDatabase['focus-visible'] || null;
    }

    // WCAG 3.1.1 - Language of Page
    if (
      normalizedCode.includes('3_1_1') ||
      normalizedCode.includes('3.1.1') ||
      normalizedCode.includes('3-1-1') ||
      normalizedCode.match(/principle3[._-]guideline3[._-]1[._-]1/)
    ) {
      return this.learningDatabase['language-attribute'] || null;
    }

    // WCAG 3.3.2 - Labels or Instructions
    if (
      normalizedCode.includes('3_3_2') ||
      normalizedCode.includes('3.3.2') ||
      normalizedCode.includes('3-3-2') ||
      normalizedCode.match(/principle3[._-]guideline3[._-]3[._-]2/)
    ) {
      return this.learningDatabase['form-label'] || null;
    }

    // WCAG 4.1.2 - Name, Role, Value (Buttons, ARIA)
    if (
      normalizedCode.includes('4_1_2') ||
      normalizedCode.includes('4.1.2') ||
      normalizedCode.includes('4-1-2') ||
      normalizedCode.match(/principle4[._-]guideline4[._-]1[._-]2/)
    ) {
      // Check if it's more likely a button or ARIA issue
      if (normalizedCode.includes('button') || normalizedCode.includes('btn')) {
        return this.learningDatabase['button-name'] || null;
      }
      if (normalizedCode.includes('aria')) {
        return this.learningDatabase['aria-usage'] || null;
      }
      // Default to button-name for 4.1.2
      return this.learningDatabase['button-name'] || null;
    }

    // Try matching by issue type patterns (fallback)
    if (normalizedCode.includes('image') || normalizedCode.includes('img')) {
      return this.learningDatabase['image-alt'] || null;
    }
    if (normalizedCode.includes('link') || normalizedCode.includes('a ')) {
      return this.learningDatabase['link-name'] || null;
    }
    if (
      normalizedCode.includes('heading') ||
      normalizedCode.includes('h1') ||
      normalizedCode.includes('h2')
    ) {
      return this.learningDatabase['heading-order'] || null;
    }
    if (
      normalizedCode.includes('color') ||
      normalizedCode.includes('contrast')
    ) {
      return this.learningDatabase['color-contrast'] || null;
    }
    if (
      normalizedCode.includes('form') ||
      normalizedCode.includes('label') ||
      normalizedCode.includes('input')
    ) {
      return this.learningDatabase['form-label'] || null;
    }

    return null;
  }

  /**
   * Database of learning content for common accessibility issues
   */
  private static learningDatabase: Record<string, LearningModeContent> = {
    'image-alt': {
      whyItMatters: `Images without alternative text are invisible to screen reader users. When a screen reader encounters an image without alt text, it may skip it entirely or read out the filename, which is often meaningless. This creates a barrier for users who rely on assistive technologies to understand the content of your page. Images that convey information, context, or meaning must have descriptive alt text so all users can access that information.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 1.1.1 (Level A): Non-text Content
      
All non-text content that is presented to the user has a text alternative that serves the equivalent purpose, except for decorative images which should use empty alt attributes (alt=""). 

For informative images: Provide descriptive alt text that conveys the same information or function as the image.
For decorative images: Use alt="" to indicate the image is purely decorative.
For functional images (buttons, links): Alt text should describe the function, not the appearance.`,
      howToTestManually: `1. **Screen Reader Test**: Use a screen reader (NVDA, JAWS, VoiceOver) to navigate your page. When you encounter an image, the screen reader should announce meaningful alternative text.
   
2. **Visual Inspection**: Right-click on images and inspect the HTML. Check that:
   - Informative images have descriptive alt attributes (alt="description")
   - Decorative images have empty alt attributes (alt="")
   - Functional images (buttons/links) have alt text describing their function

3. **Browser DevTools**: Use browser DevTools to temporarily remove images and see if the page still makes sense with just the alt text.

4. **Automated Tools**: Use browser extensions like WAVE or axe DevTools to identify images missing alt text.

5. **User Testing**: Ask a screen reader user to navigate your page and provide feedback on image descriptions.`,
    },

    'link-name': {
      whyItMatters: `Links without accessible names create significant barriers for screen reader users. When a link has no text content or accessible name, screen readers may announce it as "link" or read the URL, which is unhelpful. Users navigating by links (a common screen reader technique) cannot understand where links will take them. This makes navigation confusing and frustrating, potentially preventing users from accessing important content or functionality.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 2.4.4 (Level A): Link Purpose (In Context)
      
The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.

Links must have accessible names that clearly describe their purpose. The accessible name can come from:
- Visible link text
- aria-label attribute
- aria-labelledby pointing to descriptive text
- alt text for image links

Link text should be descriptive and meaningful out of context.`,
      howToTestManually: `1. **Screen Reader Test**: Use a screen reader to navigate links on your page. Each link should announce a clear, descriptive name that indicates where it leads.

2. **Link List Navigation**: Most screen readers can list all links on a page. Use this feature (e.g., NVDA: Insert+F7, JAWS: Insert+F7) and verify each link makes sense out of context.

3. **Visual Inspection**: Check that:
   - Links have visible, descriptive text (not just "click here" or "read more")
   - Image links have descriptive alt text
   - Icon-only links have aria-label or aria-labelledby attributes

4. **Keyboard Navigation**: Tab through all links and verify each one has clear, visible text that describes its purpose.

5. **Automated Tools**: Use WAVE or axe DevTools to identify links without accessible names.`,
    },

    'heading-order': {
      whyItMatters: `Proper heading hierarchy is crucial for screen reader users to understand page structure and navigate efficiently. Screen readers use headings to create a document outline, allowing users to jump between sections. When headings are skipped (e.g., going from h1 to h3) or used out of order, the document structure becomes confusing. Users lose context about where they are in the page hierarchy and may miss important content sections.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 1.3.1 (Level A): Info and Relationships
      
Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.

Headings should follow a logical hierarchy:
- h1: Main page title (usually one per page)
- h2: Major section headings
- h3: Subsections under h2
- h4-h6: Further nested subsections

Never skip heading levels (e.g., don't go from h1 to h3). Use headings to structure content, not for visual styling.`,
      howToTestManually: `1. **Screen Reader Navigation**: Use a screen reader's heading navigation feature (NVDA: H, JAWS: H, VoiceOver: Cmd+Ctrl+H) to move through headings. Verify the order makes logical sense.

2. **Document Outline**: Use browser extensions like "HeadingsMap" or "WAVE" to view the document outline. Check that:
   - There's typically one h1 per page
   - Headings follow a logical hierarchy (h1 → h2 → h3, etc.)
   - No heading levels are skipped

3. **Visual Inspection**: Review your HTML and ensure headings are used for structure, not just styling. Don't use h2 because you want larger text—use CSS for styling.

4. **Automated Tools**: Run WAVE or axe DevTools to identify heading order violations.

5. **User Testing**: Ask a screen reader user to navigate your page using headings and provide feedback on the structure.`,
    },

    'color-contrast': {
      whyItMatters: `Insufficient color contrast makes text difficult or impossible to read for users with low vision, color blindness, or those viewing screens in bright sunlight. When text doesn't have enough contrast against its background, it becomes illegible, effectively excluding users from accessing your content. This is one of the most common accessibility barriers and affects a significant portion of users.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 1.4.3 (Level AA): Contrast (Minimum)
      
The visual presentation of text and images of text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold).

For Level AAA: 7:1 for normal text and 4.5:1 for large text.

Contrast ratios are calculated using:
- Relative luminance of text and background colors
- Text size and weight (larger/bolder text has lower requirements)

Note: Decorative text, logos, and inactive UI components are exempt.`,
      howToTestManually: `1. **Contrast Checker Tools**: Use online tools like WebAIM Contrast Checker or browser extensions like "Colour Contrast Analyser" to test text/background color combinations.

2. **Browser DevTools**: 
   - Use Chrome DevTools' "Accessibility" panel to check contrast ratios
   - Inspect elements and view computed contrast ratios
   - Look for warnings about insufficient contrast

3. **Visual Test**: 
   - View your page in grayscale (remove color) to see if text is still readable
   - Test in different lighting conditions if possible
   - Zoom to 200% and verify text remains readable

4. **Automated Tools**: Use WAVE, axe DevTools, or Lighthouse to identify contrast issues. These tools will flag specific elements with insufficient contrast.

5. **User Testing**: Ask users with low vision or color blindness to test your site and provide feedback on readability.`,
    },

    'form-label': {
      whyItMatters: `Form inputs without labels are inaccessible to screen reader users. When a form field lacks an associated label, screen readers cannot announce what information is expected, making forms impossible to complete. Users may encounter fields with no context about what to enter, leading to errors, frustration, and abandonment of forms. Proper labeling is essential for all users, including those using voice input software that relies on labels to identify fields.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 1.3.1 (Level A): Info and Relationships
WCAG 2.1 Success Criterion 3.3.2 (Level A): Labels or Instructions
WCAG 2.1 Success Criterion 4.1.2 (Level A): Name, Role, Value

Form inputs must have:
- Visible labels associated with inputs using the <label> element's "for" attribute matching the input's "id"
- Or inputs wrapped in <label> elements
- Or aria-label/aria-labelledby attributes for programmatic labels

Labels should clearly indicate:
- What information is required
- Whether the field is required (marked with * or "required")
- Expected format (e.g., "MM/DD/YYYY" for dates)`,
      howToTestManually: `1. **Screen Reader Test**: Use a screen reader to navigate through form fields. Each field should announce its label clearly before you can enter data.

2. **Keyboard Navigation**: Tab through form fields and verify:
   - Each field has a visible label
   - Labels are properly associated with inputs
   - Required fields are clearly marked

3. **Visual Inspection**: Check that:
   - Every input, select, and textarea has a visible label
   - Labels are positioned close to their inputs
   - Required fields are clearly indicated

4. **HTML Inspection**: Verify labels are properly associated:
   - <label for="inputId"> matches <input id="inputId">
   - Or inputs are wrapped in <label> elements
   - Or aria-label/aria-labelledby is used appropriately

5. **Automated Tools**: Use WAVE or axe DevTools to identify form fields without labels.

6. **User Testing**: Ask a screen reader user to complete your form and provide feedback on clarity and ease of use.`,
    },

    'button-name': {
      whyItMatters: `Buttons without accessible names are unusable for screen reader users. When a button has no text content or accessible name, screen readers may announce it as "button" with no context about its function. Users cannot understand what the button does or when to use it, creating a barrier to completing tasks. This is especially critical for icon-only buttons or buttons with only images.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 4.1.2 (Level A): Name, Role, Value

All user interface components (including buttons) must have accessible names that programmatically identify them.

Buttons must have accessible names from:
- Visible button text
- aria-label attribute
- aria-labelledby pointing to descriptive text
- alt text for image buttons
- title attribute (as fallback, but not recommended)

The accessible name should clearly describe the button's function.`,
      howToTestManually: `1. **Screen Reader Test**: Use a screen reader to navigate buttons. Each button should announce a clear name that describes its function.

2. **Keyboard Navigation**: Tab through interactive elements and verify buttons announce their purpose clearly.

3. **Visual Inspection**: Check that:
   - Buttons have visible text when possible
   - Icon-only buttons have aria-label attributes
   - Image buttons have descriptive alt text

4. **HTML Inspection**: Verify buttons have accessible names through text content, aria-label, or aria-labelledby.

5. **Automated Tools**: Use WAVE or axe DevTools to identify buttons without accessible names.

6. **User Testing**: Ask a screen reader user to interact with your buttons and verify they understand each button's purpose.`,
    },

    'keyboard-access': {
      whyItMatters: `Keyboard accessibility is essential for users who cannot use a mouse, including those with motor disabilities, repetitive strain injuries, or who prefer keyboard navigation. If interactive elements cannot be reached or activated via keyboard, these users are completely excluded from your website. Keyboard navigation is also the foundation for many assistive technologies, so keyboard inaccessibility creates cascading barriers.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 2.1.1 (Level A): Keyboard

All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.

All interactive elements must be:
- Reachable via Tab key navigation
- Activatable via Enter or Space key
- Have visible focus indicators
- Not require mouse-specific interactions (hover, drag-and-drop)

Focus order should follow a logical sequence.`,
      howToTestManually: `1. **Keyboard-Only Navigation**: Unplug your mouse/trackpad and navigate your entire site using only:
   - Tab: Move forward through interactive elements
   - Shift+Tab: Move backward
   - Enter/Space: Activate buttons and links
   - Arrow keys: Navigate within components (menus, sliders, etc.)

2. **Focus Indicators**: As you tab, verify:
   - All interactive elements receive focus
   - Focus indicators are clearly visible
   - Focus order follows a logical sequence

3. **Skip Links**: Check for skip navigation links that allow users to bypass repetitive content.

4. **No Keyboard Traps**: Ensure users can tab away from all components (modals, dropdowns, etc.).

5. **Automated Tools**: Use keyboard navigation testing tools and screen readers to identify keyboard accessibility issues.

6. **User Testing**: Ask users who rely on keyboard navigation to test your site and provide feedback.`,
    },

    'aria-usage': {
      whyItMatters: `ARIA (Accessible Rich Internet Applications) attributes enhance accessibility when used correctly, but can create barriers when misused. Incorrect ARIA can override native HTML semantics, create confusing announcements for screen readers, or hide content from assistive technologies. Understanding when and how to use ARIA is crucial for creating accessible dynamic content.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 4.1.2 (Level A): Name, Role, Value

ARIA should be used to:
- Enhance native HTML semantics when needed
- Provide accessible names and descriptions
- Communicate dynamic state changes
- Create accessible custom components

ARIA best practices:
- Prefer native HTML elements over ARIA when possible
- Don't override native semantics unnecessarily
- Ensure ARIA attributes are valid and properly used
- Test with screen readers to verify ARIA works as intended`,
      howToTestManually: `1. **Screen Reader Test**: Use a screen reader to test components with ARIA. Verify:
   - ARIA labels are announced correctly
   - Roles are appropriate and helpful
   - State changes are communicated
   - No redundant or conflicting information

2. **HTML Inspection**: Check that:
   - ARIA attributes are valid (use ARIA Authoring Practices Guide)
   - Native HTML semantics aren't overridden unnecessarily
   - aria-label/aria-labelledby provide clear names
   - aria-describedby adds helpful context when needed

3. **Validation Tools**: Use ARIA validation tools to check for:
   - Invalid ARIA attributes
   - Missing required ARIA properties
   - Conflicting ARIA and native semantics

4. **Automated Tools**: Use axe DevTools to identify ARIA misuse and issues.

5. **User Testing**: Ask screen reader users to test ARIA-enhanced components and provide feedback on clarity and usability.`,
    },

    'focus-visible': {
      whyItMatters: `Visible focus indicators are essential for keyboard users to understand where they are on the page. Without clear focus indicators, users cannot see which element has keyboard focus, making navigation confusing and error-prone. Many users rely on focus indicators to track their position, especially on complex pages with many interactive elements.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 2.4.7 (Level AA): Focus Visible

Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.

Focus indicators must be:
- Clearly visible (sufficient contrast)
- At least 2px thick
- Visible around the entire focused element
- Not obscured by other elements

Common focus styles include outlines, borders, or background color changes.`,
      howToTestManually: `1. **Keyboard Navigation**: Tab through all interactive elements and verify:
   - Each element shows a clear focus indicator
   - Focus indicators are visible and distinct
   - Focus order follows a logical sequence

2. **Visual Inspection**: Check that:
   - Focus styles aren't removed with CSS (outline: none without replacement)
   - Focus indicators have sufficient contrast
   - Focus indicators are at least 2px thick

3. **Browser Testing**: Test in multiple browsers as focus styles can vary. Ensure custom focus styles work across browsers.

4. **Automated Tools**: Use accessibility testing tools to identify elements missing focus indicators.

5. **User Testing**: Ask keyboard users to navigate your site and verify they can easily track their position using focus indicators.`,
    },

    'language-attribute': {
      whyItMatters: `The page language attribute helps screen readers pronounce content correctly and allows translation tools to work properly. When the language isn't declared, screen readers may use the wrong pronunciation rules, making content difficult to understand. This is especially important for pages with content in multiple languages.`,
      wcagGuideline: `WCAG 2.1 Success Criterion 3.1.1 (Level A): Language of Page

The default human language of each Web page can be programmatically determined.

The <html> element must have a lang attribute indicating the primary language:
- <html lang="en"> for English
- <html lang="es"> for Spanish
- etc.

For content in different languages within a page, use lang attributes on specific elements.`,
      howToTestManually: `1. **HTML Inspection**: Check that the <html> element has a lang attribute:
   - <html lang="en"> for English content
   - Use appropriate language codes (ISO 639-1)

2. **Screen Reader Test**: Use a screen reader and verify content is pronounced correctly in the declared language.

3. **Multi-language Content**: If your page has content in multiple languages, verify that specific elements have lang attributes for non-default languages.

4. **Automated Tools**: Use WAVE or axe DevTools to identify pages missing the lang attribute.

5. **Browser DevTools**: Inspect the <html> element and verify the lang attribute is present and correct.`,
    },
  };
}
