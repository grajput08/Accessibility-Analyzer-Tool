<template>
  <div class="accessibility-analyzer">
    <!-- Analysis Form -->
    <div class="card mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        Accessibility Analysis
      </h2>

      <form @submit.prevent="handleAnalyze" class="space-y-4">
        <div>
          <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            id="url"
            v-model="formData.url"
            type="url"
            required
            placeholder="https://example.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            :disabled="store.isLoading"
          />
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Standard
            </label>
            <select
              v-model="formData.standard"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              :disabled="store.isLoading"
            >
              <option value="WCAG2A">WCAG 2.0 Level A</option>
              <option value="WCAG2AA">WCAG 2.0 Level AA</option>
              <option value="WCAG2AAA">WCAG 2.0 Level AAA</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Include Warnings
            </label>
            <select
              v-model="formData.includeWarnings"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              :disabled="store.isLoading"
            >
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button
            type="submit"
            class="btn-primary flex items-center"
            :disabled="store.isLoading || !formData.url"
          >
            <svg
              v-if="store.isLoading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-if="store.isLoading">Analyzing...</span>
            <span v-else>Start Analysis</span>
          </button>

          <button
            type="button"
            @click="handleReset"
            class="btn-secondary"
            :disabled="store.isLoading"
          >
            Reset
          </button>
        </div>
      </form>
    </div>

    <!-- Error Display -->
    <div v-if="store.error" class="card mb-6 bg-red-50 border-red-200">
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-red-400 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-red-800">{{ store.error }}</span>
      </div>
    </div>

    <!-- Results Display -->
    <div v-if="store.isAnalysisComplete && store.results" class="card">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Analysis Results</h3>

      <!-- AIM Score -->
      <div
        class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200"
      >
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-1">AIM Score</h4>
            <p class="text-sm text-gray-600">Accessibility Impact Metric</p>
          </div>
          <div class="text-right">
            <div
              class="text-4xl font-bold"
              :class="getAimScoreColor(store.results.aimScore)"
            >
              {{ store.results.aimScore }}
            </div>
            <div class="text-sm text-gray-600 mt-1">out of 10</div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid md:grid-cols-4 gap-4 mb-6">
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">
            {{ store.issuesByType.errors }}
          </div>
          <div class="text-sm text-green-700">Errors</div>
        </div>
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600">
            {{ store.issuesByType.warnings }}
          </div>
          <div class="text-sm text-yellow-700">Warnings</div>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">
            {{ store.issuesByType.notices }}
          </div>
          <div class="text-sm text-blue-700">Notices</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-600">
            {{ store.totalIssues }}
          </div>
          <div class="text-sm text-gray-700">Total Issues</div>
        </div>
      </div>

      <!-- Document Info -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-semibold text-gray-900 mb-2">Document Information</h4>
        <p class="text-sm text-gray-600">
          <strong>Title:</strong> {{ store.results.documentTitle }}
        </p>
        <p class="text-sm text-gray-600">
          <strong>URL:</strong> {{ store.results.pageUrl }}
        </p>
        <p class="text-sm text-gray-600">
          <strong>Analyzed:</strong> {{ formatDate(store.results.timestamp) }}
        </p>
      </div>

      <!-- Issues Tabs -->
      <div v-if="store.results.issues.length > 0">
        <h4 class="font-semibold text-gray-900 mb-4">Issues Found</h4>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in availableTabs"
              :key="tab.type"
              @click="activeTab = tab.type"
              class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
              :class="{
                'border-red-500 text-red-600':
                  activeTab === tab.type && tab.type === 'error',
                'border-yellow-500 text-yellow-600':
                  activeTab === tab.type && tab.type === 'warning',
                'border-blue-500 text-blue-600':
                  activeTab === tab.type && tab.type === 'notice',
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                  activeTab !== tab.type,
              }"
            >
              {{ tab.label }}
              <span
                class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-red-100 text-red-800': tab.type === 'error',
                  'bg-yellow-100 text-yellow-800': tab.type === 'warning',
                  'bg-blue-100 text-blue-800': tab.type === 'notice',
                }"
              >
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="space-y-4">
          <div
            v-for="(issue, index) in filteredIssues"
            :key="index"
            class="p-4 border rounded-lg"
            :class="{
              'border-red-200 bg-red-50': issue.type === 'error',
              'border-yellow-200 bg-yellow-50': issue.type === 'warning',
              'border-blue-200 bg-blue-50': issue.type === 'notice',
            }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                    :class="{
                      'bg-red-100 text-red-800': issue.type === 'error',
                      'bg-yellow-100 text-yellow-800': issue.type === 'warning',
                      'bg-blue-100 text-blue-800': issue.type === 'notice',
                    }"
                  >
                    {{ issue.type.toUpperCase() }}
                  </span>
                  <span class="text-sm text-gray-500">{{ issue.code }}</span>
                </div>
                <p class="text-sm text-gray-900 mb-2 break-words">
                  {{ issue.message }}
                </p>
                <p class="text-xs text-gray-600 break-all">
                  <strong>Selector:</strong> {{ issue.selector }}
                </p>
                <div v-if="issue.context" class="mt-2">
                  <div class="mb-2">
                    <p class="text-xs text-gray-600 font-medium">
                      <strong>Context:</strong>
                    </p>
                  </div>
                  <div
                    class="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
                  >
                    <div
                      class="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between"
                    >
                      <span class="text-xs text-gray-300 font-medium"
                        >HTML</span
                      >
                      <button
                        @click="copyToClipboard(issue.context, index)"
                        @mouseenter="showTooltip = index"
                        @mouseleave="showTooltip = null"
                        class="relative inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
                      >
                        <svg
                          class="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          ></path>
                        </svg>
                        Copy
                        <!-- Tooltip -->
                        <div
                          v-if="showTooltip === index"
                          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-10"
                        >
                          Copy to clipboard
                          <!-- Arrow -->
                          <div
                            class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"
                          ></div>
                        </div>
                      </button>
                    </div>
                    <pre
                      class="text-xs text-gray-100 p-4 font-mono leading-relaxed whitespace-pre-wrap break-words"
                      >{{ issue.context }}</pre
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Issues in Current Tab -->
        <div v-if="filteredIssues.length === 0" class="text-center py-8">
          <svg
            class="w-16 h-16 text-green-400 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-green-600 font-semibold">
            No {{ activeTab }} issues found!
          </p>
          <p class="text-gray-600 text-sm">
            Great job! No {{ activeTab }} issues detected in this analysis.
          </p>
        </div>
      </div>

      <!-- No Issues -->
      <div v-else class="text-center py-8">
        <svg
          class="w-16 h-16 text-green-400 mx-auto mb-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="text-green-600 font-semibold">
          No accessibility issues found!
        </p>
        <p class="text-gray-600 text-sm">
          The analyzed page meets the selected accessibility standards.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAccessibilityStore } from '~/stores/accessibility';

const store = useAccessibilityStore();

const formData = ref({
  url: '',
  standard: 'WCAG2AA',
  includeWarnings: true,
  includeNotices: false,
});

const activeTab = ref('error');
const showTooltip = ref(null);

const handleAnalyze = async () => {
  try {
    await store.analyzeUrl(formData.value);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};

const handleReset = () => {
  formData.value = {
    url: '',
    standard: 'WCAG2AA',
    includeWarnings: true,
    includeNotices: true,
  };
  store.clearResults();
  activeTab.value = 'error';
  showTooltip.value = null;
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

// Computed properties for tabs
const availableTabs = computed(() => {
  if (!store.results) return [];

  const tabs = [];
  const { errors, warnings, notices } = store.issuesByType;

  if (errors > 0) tabs.push({ type: 'error', label: 'Errors', count: errors });
  if (warnings > 0)
    tabs.push({ type: 'warning', label: 'Warnings', count: warnings });
  if (notices > 0)
    tabs.push({ type: 'notice', label: 'Notices', count: notices });

  return tabs;
});

const filteredIssues = computed(() => {
  if (!store.results) return [];
  return store.results.issues.filter((issue) => issue.type === activeTab.value);
});

// Copy to clipboard functionality
const copyToClipboard = async (text, index) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

// Get AIM score color based on score value
const getAimScoreColor = (score) => {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
};

// Set initial active tab when results change
watch(
  () => store.results,
  (newResults) => {
    if (newResults && availableTabs.value.length > 0) {
      activeTab.value = availableTabs.value[0].type;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.accessibility-analyzer {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
