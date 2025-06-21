# Frontend Accessibility Analyzer

This frontend integrates with the backend `/analyse` API using Pinia store for state management.

## Features

- **Pinia Store**: Centralized state management for accessibility analysis
- **TypeScript Support**: Full type safety with interfaces
- **Real-time Analysis**: Live accessibility testing with Pa11y
- **History Management**: Track previous analyses
- **Error Handling**: Comprehensive error management

## Store Usage

### Basic Usage

```vue
<script setup>
import { useAccessibilityStore } from '~/stores/accessibility';

const store = useAccessibilityStore();

// Analyze a URL
const handleAnalyze = async () => {
  try {
    await store.analyzeUrl({
      url: 'https://example.com',
      standard: 'WCAG2AA',
      includeWarnings: true,
      includeNotices: true,
    });
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="store.isLoading">Analyzing...</div>

    <!-- Error State -->
    <div v-if="store.error" class="error">{{ store.error }}</div>

    <!-- Results -->
    <div v-if="store.results">
      <h3>Results for {{ store.results.documentTitle }}</h3>
      <p>Total Issues: {{ store.totalIssues }}</p>
      <p>Errors: {{ store.issuesByType.errors }}</p>
      <p>Warnings: {{ store.issuesByType.warnings }}</p>
      <p>Notices: {{ store.issuesByType.notices }}</p>
    </div>
  </div>
</template>
```

### Store State

```typescript
interface AccessibilityState {
  isLoading: boolean; // Loading state
  results: AccessibilityAnalysisResponse | null; // Analysis results
  error: string | null; // Error message
  history: AccessibilityAnalysisResponse[]; // Analysis history
}
```

### Store Getters

- `totalIssues`: Total number of issues found
- `issuesByType`: Object with counts for errors, warnings, notices
- `standardsSummary`: Summary of standards compliance
- `isAnalysisComplete`: Boolean indicating if analysis is done
- `recentHistory`: Last 5 analyses

### Store Actions

- `analyzeUrl(request)`: Analyze a URL for accessibility issues
- `clearResults()`: Clear current results
- `clearError()`: Clear error state
- `clearHistory()`: Clear analysis history
- `loadFromHistory(index)`: Load a specific analysis from history

## API Integration

The store uses the backend API at `/api/v1/analyse` with the following request format:

```typescript
interface AccessibilityAnalysisRequest {
  url: string; // Required: URL to analyze
  standard?: 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' | 'Section508';
  includeWarnings?: boolean; // Default: true
  includeNotices?: boolean; // Default: true
  actions?: string[]; // Optional: Pre-analysis actions
  wait?: number; // Optional: Wait time in ms
  timeout?: number; // Optional: Timeout in ms
  hideElements?: string; // Optional: CSS selectors to hide
}
```

## Response Format

```typescript
interface AccessibilityAnalysisResponse {
  documentTitle: string;
  pageUrl: string;
  issues: Pa11yIssue[];
  standards: {
    [key: string]: {
      errors: number;
      warnings: number;
      notices: number;
    };
  };
  timestamp: string;
}
```

## Components

### AccessibilityAnalyzer.vue

A complete component that demonstrates:

- Form for URL input and analysis options
- Real-time loading states
- Error handling and display
- Results visualization with issue breakdown
- Responsive design with Tailwind CSS

## Setup

1. Ensure the backend is running on `http://localhost:3001`
2. The API base URL is configured in `nuxt.config.ts`
3. Pinia is already configured in the Nuxt modules

## Error Handling

The store provides comprehensive error handling:

- Network errors
- API validation errors
- Timeout errors
- Invalid URL errors

All errors are stored in `store.error` and can be displayed to users.

## History Management

The store automatically maintains a history of the last 10 analyses:

- Access via `store.history`
- Recent analyses via `store.recentHistory`
- Load previous results with `store.loadFromHistory(index)`

## TypeScript Support

Full TypeScript support is provided with:

- Type-safe store state
- Interface definitions for all API requests/responses
- Proper error typing
- Component prop validation
