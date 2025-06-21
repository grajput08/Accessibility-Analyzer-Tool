<template>
  <div class="fade-in">
    <!-- Header Section -->
    <section class="bg-white py-12 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Analyze Website Accessibility
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter a URL to analyze its accessibility compliance and get detailed
            recommendations
          </p>
        </div>
      </div>
    </section>

    <!-- Analysis Form -->
    <section class="py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="card">
          <form @submit.prevent="analyzeWebsite" class="space-y-6">
            <div>
              <label
                for="url"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Website URL
              </label>
              <input
                id="url"
                v-model="url"
                type="url"
                required
                placeholder="https://example.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                :disabled="isAnalyzing"
              />
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Level
                </label>
                <select
                  v-model="analysisLevel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  :disabled="isAnalyzing"
                >
                  <option value="basic">Basic</option>
                  <option value="comprehensive">Comprehensive</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  WCAG Version
                </label>
                <select
                  v-model="wcagVersion"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  :disabled="isAnalyzing"
                >
                  <option value="2.1">WCAG 2.1</option>
                  <option value="2.0">WCAG 2.0</option>
                </select>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <button
                type="submit"
                class="btn-primary flex items-center"
                :disabled="isAnalyzing || !url"
              >
                <svg
                  v-if="isAnalyzing"
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
                <span v-if="isAnalyzing">Analyzing...</span>
                <span v-else>Start Analysis</span>
              </button>

              <button
                type="button"
                @click="resetForm"
                class="btn-secondary"
                :disabled="isAnalyzing"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <!-- Results Section -->
        <div v-if="analysisResults" class="mt-8">
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Analysis Results
            </h2>

            <!-- Summary -->
            <div class="grid md:grid-cols-3 gap-4 mb-8">
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">
                  {{ analysisResults.passed }}
                </div>
                <div class="text-sm text-green-700">Passed Tests</div>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-600">
                  {{ analysisResults.failed }}
                </div>
                <div class="text-sm text-red-700">Failed Tests</div>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">
                  {{ analysisResults.warnings }}
                </div>
                <div class="text-sm text-yellow-700">Warnings</div>
              </div>
            </div>

            <!-- Issues List -->
            <div
              v-if="analysisResults.issues && analysisResults.issues.length > 0"
            >
              <h3 class="text-xl font-semibold text-gray-900 mb-4">
                Issues Found
              </h3>
              <div class="space-y-4">
                <div
                  v-for="issue in analysisResults.issues"
                  :key="issue.id"
                  class="p-4 border border-gray-200 rounded-lg"
                  :class="{
                    'border-red-200 bg-red-50': issue.severity === 'error',
                    'border-yellow-200 bg-yellow-50':
                      issue.severity === 'warning',
                  }"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">
                        {{ issue.title }}
                      </h4>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ issue.description }}
                      </p>
                      <div class="mt-2">
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="{
                            'bg-red-100 text-red-800':
                              issue.severity === 'error',
                            'bg-yellow-100 text-yellow-800':
                              issue.severity === 'warning',
                          }"
                        >
                          {{ issue.severity }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const url = ref("");
const analysisLevel = ref("comprehensive");
const wcagVersion = ref("2.1");
const isAnalyzing = ref(false);
const analysisResults = ref(null);

const analyzeWebsite = async () => {
  if (!url.value) return;

  isAnalyzing.value = true;
  analysisResults.value = null;

  try {
    // Simulate API call - replace with actual backend call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock results for demonstration
    analysisResults.value = {
      url: url.value,
      timestamp: new Date().toISOString(),
      passed: 15,
      failed: 3,
      warnings: 2,
      issues: [
        {
          id: 1,
          title: "Missing alt text on images",
          description:
            "Several images on the page are missing alt text, which is essential for screen readers.",
          severity: "error",
          wcagCriteria: "1.1.1",
        },
        {
          id: 2,
          title: "Insufficient color contrast",
          description:
            "Text color contrast ratio does not meet WCAG AA standards.",
          severity: "error",
          wcagCriteria: "1.4.3",
        },
        {
          id: 3,
          title: "Missing heading structure",
          description:
            "Page heading structure could be improved for better navigation.",
          severity: "warning",
          wcagCriteria: "1.3.1",
        },
      ],
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    // Handle error appropriately
  } finally {
    isAnalyzing.value = false;
  }
};

const resetForm = () => {
  url.value = "";
  analysisLevel.value = "comprehensive";
  wcagVersion.value = "2.1";
  analysisResults.value = null;
};
</script>
