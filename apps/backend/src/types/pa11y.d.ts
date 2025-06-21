declare module 'pa11y' {
  interface Pa11yOptions {
    standard?: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA';
    includeNotices?: boolean;
    includeWarnings?: boolean;
    timeout?: number;
    wait?: number;
    chromeLaunchConfig?: {
      args?: string[];
    };
  }

  interface Pa11yIssue {
    code: string;
    message: string;
    type: 'error' | 'warning' | 'notice';
    selector: string;
    context: string;
    help: string;
    helpUrl: string;
  }

  interface Pa11yResult {
    issues: Pa11yIssue[];
  }

  function pa11y(url: string, options?: Pa11yOptions): Promise<Pa11yResult>;

  export = pa11y;
}
