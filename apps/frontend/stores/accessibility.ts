import { defineStore } from 'pinia';
import type {
  AccessibilityAnalysisRequest,
  AccessibilityAnalysisResponse,
  AccessibilityState,
} from '../types/accessibility';
import { useAccessibilityApi } from '~/composables/useAccessibilityApi';

export const useAccessibilityStore = defineStore('accessibility', {
  state: (): AccessibilityState => ({
    isLoading: false,
    results: null,
    error: null,
    history: [],
  }),

  getters: {
    /**
     * Get total number of issues
     */
    totalIssues: (state) => {
      if (!state.results) return 0;
      return state.results.issues.length;
    },

    /**
     * Get issues by type
     */
    issuesByType: (state) => {
      if (!state.results) return { errors: 0, warnings: 0, notices: 0 };

      const errors = state.results.issues.filter(
        (issue) => issue.type === 'error',
      ).length;
      const warnings = state.results.issues.filter(
        (issue) => issue.type === 'warning',
      ).length;
      const notices = state.results.issues.filter(
        (issue) => issue.type === 'notice',
      ).length;

      return { errors, warnings, notices };
    },

    /**
     * Get standards summary
     */
    standardsSummary: (state) => {
      if (!state.results) return {};
      return state.results.standards;
    },

    /**
     * Check if analysis is complete
     */
    isAnalysisComplete: (state) => {
      return !state.isLoading && state.results !== null;
    },

    /**
     * Get recent analysis history
     */
    recentHistory: (state) => {
      return state.history.slice(-5); // Last 5 analyses
    },
  },

  actions: {
    /**
     * Analyze a URL for accessibility issues
     */
    async analyzeUrl(request: AccessibilityAnalysisRequest) {
      this.isLoading = true;
      this.error = null;

      try {
        const { analyzeUrl } = useAccessibilityApi();
        const response = await analyzeUrl(request);

        this.results = response;
        this.history.push(response);

        // Keep only last 10 analyses in history
        if (this.history.length > 10) {
          this.history = this.history.slice(-10);
        }

        return response;
      } catch (error: any) {
        console.error('Accessibility analysis error:', error);
        this.error =
          error.message || 'An error occurred while analyzing the URL';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Clear current results
     */
    clearResults() {
      this.results = null;
      this.error = null;
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Clear history
     */
    clearHistory() {
      this.history = [];
    },

    /**
     * Get analysis from history by index
     */
    getFromHistory(index: number): AccessibilityAnalysisResponse | null {
      if (index >= 0 && index < this.history.length) {
        return this.history[index];
      }
      return null;
    },

    /**
     * Load analysis from history
     */
    loadFromHistory(index: number) {
      const analysis = this.getFromHistory(index);
      if (analysis) {
        this.results = analysis;
        this.error = null;
      }
    },
  },
});
