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

      <!-- Training Quiz CTA -->
      <div
        v-if="store.results.issues.length > 0"
        class="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200"
      >
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="mb-4 md:mb-0">
            <h4 class="text-lg font-semibold text-gray-900 mb-2">
              📘 Test Your Knowledge
            </h4>
            <p class="text-sm text-gray-600">
              Generate an AI-powered quiz based on the issues found on this
              page. Learn while you test!
            </p>
          </div>
          <NuxtLink
            :to="`/training?issues=${encodeURIComponent(JSON.stringify(store.results.issues))}`"
            class="btn-primary inline-flex items-center justify-center whitespace-nowrap"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Start Training Quiz
          </NuxtLink>
        </div>
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

                <!-- Learning Mode Section (Built-in Education) -->
                <div class="mt-6 pt-6 border-t-2 border-purple-200">
                  <!-- Header/Button Section - Shown when content is NOT loaded (including loading state) -->
                  <div
                    v-if="!issue.learningContent"
                    class="flex items-center justify-between mb-4"
                  >
                    <h4
                      class="text-lg font-bold text-gray-900 flex items-center"
                    >
                      <svg
                        class="w-5 h-5 mr-2 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Accessibility Learning Mode
                      <span
                        class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        Built-in Education
                      </span>
                    </h4>
                    <button
                      @click="toggleLearningMode(issue, index)"
                      :disabled="
                        loadingLearningContent[
                          `${issue.code}-${issue.selector}`
                        ]
                      "
                      class="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <svg
                        v-if="
                          loadingLearningContent[
                            `${issue.code}-${issue.selector}`
                          ]
                        "
                        class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      <svg
                        v-else
                        class="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span
                        v-if="
                          loadingLearningContent[
                            `${issue.code}-${issue.selector}`
                          ]
                        "
                      >
                        Loading...
                      </span>
                      <span v-else>Open Learning Mode</span>
                    </button>
                  </div>

                  <!-- Learning Content - Shows when loaded, with collapse button -->
                  <div v-else-if="issue.learningContent" class="space-y-4">
                    <!-- Collapse Button -->
                    <div class="flex items-center justify-between mb-4">
                      <h4
                        class="text-lg font-bold text-gray-900 flex items-center"
                      >
                        <svg
                          class="w-5 h-5 mr-2 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        Accessibility Learning Mode
                        <span
                          class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          Built-in Education
                        </span>
                      </h4>
                    </div>
                    <!-- Why It Matters -->
                    <div
                      class="bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm"
                    >
                      <div class="flex items-start">
                        <div
                          class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3"
                        >
                          <svg
                            class="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <h5
                            class="text-sm font-bold text-gray-900 mb-2 flex items-center"
                          >
                            Why It Matters
                          </h5>
                          <p
                            class="text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                          >
                            {{ issue.learningContent.whyItMatters }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- What WCAG Says -->
                    <div
                      class="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm"
                    >
                      <div class="flex items-start">
                        <div
                          class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3"
                        >
                          <svg
                            class="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <h5
                            class="text-sm font-bold text-gray-900 mb-2 flex items-center"
                          >
                            What WCAG Says
                          </h5>
                          <p
                            class="text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                          >
                            {{ issue.learningContent.wcagGuideline }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- How to Test Manually -->
                    <div
                      class="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm"
                    >
                      <div class="flex items-start">
                        <div
                          class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3"
                        >
                          <svg
                            class="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <h5
                            class="text-sm font-bold text-gray-900 mb-4 flex items-center"
                          >
                            How to Test Manually
                          </h5>
                          <!-- Array format -->
                          <ol
                            v-if="
                              Array.isArray(
                                issue.learningContent.howToTestManually,
                              )
                            "
                            class="space-y-4 list-none pl-0"
                          >
                            <li
                              v-for="(step, stepIndex) in issue.learningContent
                                .howToTestManually"
                              :key="stepIndex"
                              class="flex items-start group"
                            >
                              <div
                                class="text-sm text-gray-700 leading-relaxed flex-1 pt-0.5 markdown-content"
                                v-html="renderMarkdown(step)"
                              ></div>
                            </li>
                          </ol>
                          <!-- String format (fallback) -->
                          <div
                            v-else
                            class="text-sm text-gray-700 leading-relaxed markdown-content"
                            v-html="
                              renderMarkdown(
                                issue.learningContent.howToTestManually,
                              )
                            "
                          ></div>
                        </div>
                      </div>
                    </div>

                    <!-- Article Links -->
                    <div
                      v-if="
                        issue.learningContent.articleLinks &&
                        issue.learningContent.articleLinks.length > 0
                      "
                      class="bg-gradient-to-br from-indigo-50 to-blue-50 border-l-4 border-indigo-500 rounded-lg p-4 shadow-sm"
                    >
                      <div class="flex items-start">
                        <div
                          class="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3"
                        >
                          <svg
                            class="w-6 h-6 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <h5
                            class="text-sm font-bold text-gray-900 mb-3 flex items-center"
                          >
                            Recommended Articles
                          </h5>
                          <div class="space-y-2">
                            <a
                              v-for="(article, articleIndex) in issue
                                .learningContent.articleLinks"
                              :key="articleIndex"
                              :href="article.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="block p-3 bg-white rounded-lg border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 group"
                            >
                              <div class="flex items-start justify-between">
                                <div class="flex-1">
                                  <h6
                                    class="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1"
                                  >
                                    {{ article.title }}
                                  </h6>
                                  <p
                                    v-if="article.description"
                                    class="text-xs text-gray-600 leading-relaxed"
                                  >
                                    {{ article.description }}
                                  </p>
                                </div>
                                <svg
                                  class="w-5 h-5 text-indigo-500 ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- YouTube Video Links -->
                    <div
                      v-if="
                        issue.learningContent.youtubeVideoLinks &&
                        issue.learningContent.youtubeVideoLinks.length > 0
                      "
                      class="bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm"
                    >
                      <div class="flex items-start">
                        <div
                          class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3"
                        >
                          <svg
                            class="w-6 h-6 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <h5
                            class="text-sm font-bold text-gray-900 mb-3 flex items-center"
                          >
                            Recommended Videos
                          </h5>
                          <div class="space-y-2">
                            <a
                              v-for="(video, videoIndex) in issue
                                .learningContent.youtubeVideoLinks"
                              :key="videoIndex"
                              :href="video.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="block p-3 bg-white rounded-lg border-2 border-red-200 hover:border-red-400 hover:shadow-md transition-all duration-200 group"
                            >
                              <div class="flex items-start justify-between">
                                <div class="flex-1">
                                  <h6
                                    class="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-1"
                                  >
                                    {{ video.title }}
                                  </h6>
                                  <p
                                    v-if="video.description"
                                    class="text-xs text-gray-600 leading-relaxed"
                                  >
                                    {{ video.description }}
                                  </p>
                                </div>
                                <svg
                                  class="w-5 h-5 text-red-500 ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- AI Explanation Section -->
                <div class="mt-6 pt-6 border-t-2 border-gray-200">
                  <!-- Header -->
                  <div class="flex items-center justify-between mb-4">
                    <h4
                      class="text-lg font-bold text-gray-900 flex items-center"
                    >
                      <svg
                        class="w-5 h-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      AI-Powered Explanation
                    </h4>
                    <button
                      v-if="
                        issue.explanation &&
                        !loadingExplanations[`${issue.code}-${issue.selector}`]
                      "
                      @click="fetchExplanation(issue, index)"
                      class="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                      <svg
                        class="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Regenerate
                    </button>
                  </div>

                  <!-- Loading State -->
                  <div
                    v-if="
                      loadingExplanations[`${issue.code}-${issue.selector}`]
                    "
                    class="flex flex-col items-center justify-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200"
                  >
                    <svg
                      class="animate-spin h-8 w-8 mb-3 text-blue-600"
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
                    <p class="text-sm font-medium text-gray-700">
                      Generating AI explanation...
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      This may take a few seconds
                    </p>
                  </div>

                  <!-- Get AI Explanation Button -->
                  <button
                    v-if="
                      !issue.explanation &&
                      !loadingExplanations[`${issue.code}-${issue.selector}`]
                    "
                    @click="fetchExplanation(issue, index)"
                    class="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <svg
                      class="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Get AI Explanation & Fix Suggestions
                  </button>

                  <!-- AI Explanation Content -->
                  <div
                    v-if="issue.explanation"
                    class="mt-4 space-y-5 ai-explanation-content"
                  >
                    <!-- Main Explanation Card -->
                    <div
                      class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm"
                    >
                      <div class="flex items-start">
                        <div
                          class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3"
                        >
                          <svg
                            class="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <h5
                            class="text-sm font-bold text-gray-900 mb-2 flex items-center"
                          >
                            <span class="mr-2">Overview</span>
                            <span
                              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              AI Generated
                            </span>
                          </h5>
                          <p
                            class="text-sm text-gray-700 leading-relaxed font-medium"
                          >
                            {{ issue.explanation }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Details Section -->
                    <div
                      v-if="issue.details"
                      class="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-md"
                    >
                      <h5
                        class="text-base font-bold text-gray-900 mb-4 flex items-center"
                      >
                        <svg
                          class="w-5 h-5 mr-2 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Detailed Analysis
                      </h5>
                      <div class="grid md:grid-cols-2 gap-4">
                        <!-- Impact -->
                        <div
                          class="bg-red-50 rounded-lg p-3 border border-red-200"
                        >
                          <div class="flex items-center mb-2">
                            <svg
                              class="w-4 h-4 text-red-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <span
                              class="text-xs font-semibold text-red-800 uppercase tracking-wide"
                              >Impact</span
                            >
                          </div>
                          <p class="text-sm text-gray-700 leading-relaxed">
                            {{ issue.details.impact }}
                          </p>
                        </div>

                        <!-- WCAG Guideline -->
                        <div
                          class="bg-blue-50 rounded-lg p-3 border border-blue-200"
                        >
                          <div class="flex items-center mb-2">
                            <svg
                              class="w-4 h-4 text-blue-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span
                              class="text-xs font-semibold text-blue-800 uppercase tracking-wide"
                              >WCAG Guideline</span
                            >
                          </div>
                          <p class="text-sm text-gray-700 font-medium">
                            {{ issue.details.wcagGuideline }}
                          </p>
                        </div>

                        <!-- Severity -->
                        <div
                          class="bg-orange-50 rounded-lg p-3 border border-orange-200"
                        >
                          <div class="flex items-center mb-2">
                            <svg
                              class="w-4 h-4 text-orange-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            <span
                              class="text-xs font-semibold text-orange-800 uppercase tracking-wide"
                              >Severity</span
                            >
                          </div>
                          <span
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                            :class="{
                              'bg-red-100 text-red-800 border-2 border-red-300':
                                issue.details.severity === 'critical' ||
                                issue.details.severity === 'high',
                              'bg-orange-100 text-orange-800 border-2 border-orange-300':
                                issue.details.severity === 'medium',
                              'bg-yellow-100 text-yellow-800 border-2 border-yellow-300':
                                issue.details.severity === 'low',
                            }"
                          >
                            {{ issue.details.severity.toUpperCase() }}
                          </span>
                        </div>

                        <!-- Affected Users -->
                        <div
                          v-if="
                            issue.details.affectedUsers &&
                            issue.details.affectedUsers.length > 0
                          "
                          class="bg-purple-50 rounded-lg p-3 border border-purple-200"
                        >
                          <div class="flex items-center mb-2">
                            <svg
                              class="w-4 h-4 text-purple-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <span
                              class="text-xs font-semibold text-purple-800 uppercase tracking-wide"
                              >Affected Users</span
                            >
                          </div>
                          <div class="flex flex-wrap gap-1.5">
                            <span
                              v-for="(user, userIndex) in issue.details
                                .affectedUsers"
                              :key="userIndex"
                              class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                            >
                              {{ user }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Suggestions Section -->
                    <div
                      v-if="issue.suggestions && issue.suggestions.length > 0"
                      class="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-md"
                    >
                      <h5
                        class="text-base font-bold text-gray-900 mb-4 flex items-center"
                      >
                        <svg
                          class="w-5 h-5 mr-2 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        Recommendations & Best Practices
                      </h5>
                      <div class="space-y-3">
                        <div
                          v-for="(suggestion, sugIndex) in issue.suggestions"
                          :key="sugIndex"
                          class="bg-white rounded-lg border-2 shadow-sm transition-all duration-200 hover:shadow-md"
                          :class="{
                            'border-red-300': suggestion.priority === 'high',
                            'border-orange-300':
                              suggestion.priority === 'medium',
                            'border-yellow-300': suggestion.priority === 'low',
                          }"
                        >
                          <div class="p-4">
                            <div class="flex items-start justify-between mb-2">
                              <div class="flex items-start flex-1">
                                <div
                                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5"
                                  :class="{
                                    'bg-red-100':
                                      suggestion.priority === 'high',
                                    'bg-orange-100':
                                      suggestion.priority === 'medium',
                                    'bg-yellow-100':
                                      suggestion.priority === 'low',
                                  }"
                                >
                                  <span
                                    class="text-xs font-bold"
                                    :class="{
                                      'text-red-600':
                                        suggestion.priority === 'high',
                                      'text-orange-600':
                                        suggestion.priority === 'medium',
                                      'text-yellow-600':
                                        suggestion.priority === 'low',
                                    }"
                                  >
                                    {{ sugIndex + 1 }}
                                  </span>
                                </div>
                                <div class="flex-1">
                                  <h6
                                    class="text-sm font-bold text-gray-900 mb-1"
                                  >
                                    {{ suggestion.title }}
                                  </h6>
                                  <p
                                    class="text-sm text-gray-700 leading-relaxed"
                                  >
                                    {{ suggestion.description }}
                                  </p>
                                </div>
                              </div>
                              <span
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ml-3 flex-shrink-0"
                                :class="{
                                  'bg-red-100 text-red-800 border border-red-300':
                                    suggestion.priority === 'high',
                                  'bg-orange-100 text-orange-800 border border-orange-300':
                                    suggestion.priority === 'medium',
                                  'bg-yellow-100 text-yellow-800 border border-yellow-300':
                                    suggestion.priority === 'low',
                                }"
                              >
                                {{ suggestion.priority.toUpperCase() }}
                              </span>
                            </div>
                            <div
                              v-if="suggestion.example"
                              class="mt-3 bg-gray-900 rounded-lg p-3 border border-gray-700"
                            >
                              <div
                                class="flex items-center justify-between mb-1"
                              >
                                <span class="text-xs text-gray-400 font-medium"
                                  >Example</span
                                >
                                <button
                                  @click="
                                    copyToClipboard(
                                      suggestion.example,
                                      `suggestion-${index}-${sugIndex}`,
                                    )
                                  "
                                  class="text-xs font-medium transition-colors flex items-center"
                                  :class="
                                    copiedTextId ===
                                    `suggestion-${index}-${sugIndex}`
                                      ? 'text-green-400'
                                      : 'text-gray-400 hover:text-gray-200'
                                  "
                                >
                                  <svg
                                    v-if="
                                      copiedTextId !==
                                      `suggestion-${index}-${sugIndex}`
                                    "
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
                                  <svg
                                    v-else
                                    class="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M5 13l4 4L19 7"
                                    ></path>
                                  </svg>
                                  {{
                                    copiedTextId ===
                                    `suggestion-${index}-${sugIndex}`
                                      ? 'Copied!'
                                      : 'Copy'
                                  }}
                                </button>
                              </div>
                              <p
                                class="text-xs text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-words"
                              >
                                {{ suggestion.example }}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Code Fixes Section -->
                    <div
                      v-if="issue.codeFixes && issue.codeFixes.length > 0"
                      class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-md"
                    >
                      <h5
                        class="text-base font-bold text-gray-900 mb-4 flex items-center"
                      >
                        <svg
                          class="w-5 h-5 mr-2 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                        Code Fixes & Solutions
                      </h5>
                      <div class="space-y-4">
                        <div
                          v-for="(codeFix, fixIndex) in issue.codeFixes"
                          :key="fixIndex"
                          class="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden"
                        >
                          <!-- Fix Header -->
                          <div
                            class="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-3 border-b-2 border-gray-200"
                          >
                            <div class="flex items-center justify-between">
                              <div class="flex items-center">
                                <div
                                  class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3"
                                >
                                  <svg
                                    class="w-5 h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p class="text-sm font-bold text-gray-900">
                                    {{ codeFix.description }}
                                  </p>
                                  <p class="text-xs text-gray-500 mt-0.5">
                                    Fix #{{ fixIndex + 1 }} of
                                    {{ issue.codeFixes.length }}
                                  </p>
                                </div>
                              </div>
                              <button
                                @click="
                                  copyToClipboard(
                                    codeFix.afterCode,
                                    `codefix-${index}-${fixIndex}`,
                                  )
                                "
                                class="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
                                :class="
                                  copiedTextId ===
                                  `codefix-${index}-${fixIndex}`
                                    ? 'bg-green-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                "
                              >
                                <svg
                                  v-if="
                                    copiedTextId !==
                                    `codefix-${index}-${fixIndex}`
                                  "
                                  class="w-4 h-4 mr-1.5"
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
                                <svg
                                  v-else
                                  class="w-4 h-4 mr-1.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                                {{
                                  copiedTextId ===
                                  `codefix-${index}-${fixIndex}`
                                    ? 'Copied!'
                                    : 'Copy Fixed Code'
                                }}
                              </button>
                            </div>
                          </div>

                          <!-- Code Comparison -->
                          <div class="p-5 space-y-4">
                            <!-- Before Code -->
                            <div>
                              <div class="flex items-center mb-2">
                                <div
                                  class="w-2 h-2 rounded-full bg-red-500 mr-2"
                                ></div>
                                <p
                                  class="text-xs font-bold text-red-700 uppercase tracking-wide"
                                >
                                  Before (Problematic Code)
                                </p>
                              </div>
                              <div
                                class="bg-gray-900 rounded-lg p-4 border-2 border-red-500/30"
                              >
                                <pre
                                  class="text-xs text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-words overflow-x-auto"
                                  >{{ codeFix.beforeCode }}</pre
                                >
                              </div>
                            </div>

                            <!-- Arrow Separator -->
                            <div class="flex items-center justify-center">
                              <div
                                class="flex items-center bg-gradient-to-r from-red-500 to-green-500 rounded-full p-2 shadow-lg"
                              >
                                <svg
                                  class="w-6 h-6 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </div>
                            </div>

                            <!-- After Code -->
                            <div>
                              <div class="flex items-center mb-2">
                                <div
                                  class="w-2 h-2 rounded-full bg-green-500 mr-2"
                                ></div>
                                <p
                                  class="text-xs font-bold text-green-700 uppercase tracking-wide"
                                >
                                  After (Fixed Code)
                                </p>
                              </div>
                              <div
                                class="bg-gray-900 rounded-lg p-4 border-2 border-green-500/30"
                              >
                                <pre
                                  class="text-xs text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-words overflow-x-auto"
                                  >{{ codeFix.afterCode }}</pre
                                >
                              </div>
                            </div>

                            <!-- Explanation -->
                            <div
                              class="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3"
                            >
                              <div class="flex items-start">
                                <svg
                                  class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <div>
                                  <p
                                    class="text-xs font-semibold text-blue-900 mb-1"
                                  >
                                    Why This Fix Works:
                                  </p>
                                  <p
                                    class="text-sm text-blue-800 leading-relaxed"
                                  >
                                    {{ codeFix.explanation }}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Quick Fix (backward compatibility) -->
                    <div
                      v-else-if="issue.fix"
                      class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-md"
                    >
                      <h5
                        class="text-base font-bold text-gray-900 mb-4 flex items-center"
                      >
                        <svg
                          class="w-5 h-5 mr-2 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Quick Fix
                      </h5>
                      <div
                        class="bg-white rounded-lg border-2 border-green-200 overflow-hidden shadow-sm"
                      >
                        <div
                          class="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-3 border-b-2 border-green-200 flex items-center justify-between"
                        >
                          <span class="text-sm font-semibold text-green-800"
                            >Corrected HTML Code</span
                          >
                          <button
                            @click="copyToClipboard(issue.fix, `fix-${index}`)"
                            class="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
                            :class="
                              copiedTextId === `fix-${index}`
                                ? 'bg-green-700'
                                : 'bg-green-600 hover:bg-green-700'
                            "
                          >
                            <svg
                              v-if="copiedTextId !== `fix-${index}`"
                              class="w-4 h-4 mr-1.5"
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
                            <svg
                              v-else
                              class="w-4 h-4 mr-1.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                            {{
                              copiedTextId === `fix-${index}`
                                ? 'Copied!'
                                : 'Copy Code'
                            }}
                          </button>
                        </div>
                        <div class="bg-gray-900 p-4">
                          <pre
                            class="text-xs text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-words overflow-x-auto"
                            >{{ issue.fix }}</pre
                          >
                        </div>
                      </div>
                    </div>
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
import { useAccessibilityApi } from '~/composables/useAccessibilityApi';
import { marked } from 'marked';

const store = useAccessibilityStore();
const api = useAccessibilityApi();

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Function to render markdown to HTML
const renderMarkdown = (content) => {
  if (!content) return '';
  // Convert markdown to HTML
  return marked.parse(content);
};

const formData = ref({
  url: '',
  standard: 'WCAG2AA',
  includeWarnings: true,
  includeNotices: false,
});

const activeTab = ref('error');
const showTooltip = ref(null);
const loadingExplanations = ref({});
const loadingLearningContent = ref({});
const copiedTextId = ref(null);
const expandedLearningModes = ref({});

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
    copiedTextId.value = index;
    // Reset after 2 seconds
    setTimeout(() => {
      copiedTextId.value = null;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

// Toggle learning mode for an issue
const toggleLearningMode = async (issue, index) => {
  if (!store.results) return;

  const learningKey = `${issue.code}-${issue.selector}`;
  const isExpanded = expandedLearningModes.value[learningKey];
  const hasContent = issue.learningContent;

  if (isExpanded && hasContent) {
    // Hide the content by removing it from the issue
    const issueIndex = store.results.issues.findIndex(
      (i) =>
        i.code === issue.code &&
        i.selector === issue.selector &&
        i.message === issue.message &&
        i.type === issue.type,
    );

    if (issueIndex !== -1) {
      const targetIssue = store.results.issues[issueIndex];
      targetIssue.learningContent = undefined;
    }
    expandedLearningModes.value[learningKey] = false;
  } else if (!isExpanded && !hasContent) {
    // Expand and fetch content
    expandedLearningModes.value[learningKey] = true;
    await fetchLearningContent(issue, index);
  }
};

// Fetch learning content for an issue (using AI-powered endpoint)
const fetchLearningContent = async (issue, index) => {
  if (!store.results) return;

  // Use a unique key for loading state (code + selector)
  const loadingKey = `${issue.code}-${issue.selector}`;
  loadingLearningContent.value[loadingKey] = true;

  try {
    // Use AI-powered endpoint for richer content with articles and videos
    const learningContent = await api.getLearningContentWithAI(issue);

    // Fallback to static content if AI generation fails
    if (!learningContent) {
      const staticContent = await api.getLearningContent(issue.code);
      if (staticContent) {
        // Update the issue in the store results
        const issueIndex = store.results.issues.findIndex(
          (i) =>
            i.code === issue.code &&
            i.selector === issue.selector &&
            i.message === issue.message &&
            i.type === issue.type,
        );

        if (issueIndex !== -1) {
          const targetIssue = store.results.issues[issueIndex];
          targetIssue.learningContent = staticContent;
        }
      }
      return;
    }

    // Update the issue in the store results
    // Find the issue in the original results array
    const issueIndex = store.results.issues.findIndex(
      (i) =>
        i.code === issue.code &&
        i.selector === issue.selector &&
        i.message === issue.message &&
        i.type === issue.type,
    );

    if (issueIndex !== -1 && learningContent) {
      // Directly update the issue properties (Pinia reactivity handles this)
      const targetIssue = store.results.issues[issueIndex];
      targetIssue.learningContent = learningContent;
    }
  } catch (error) {
    console.error('Failed to fetch learning content:', error);
    // Try fallback to static content
    try {
      const staticContent = await api.getLearningContent(issue.code);
      if (staticContent) {
        const issueIndex = store.results.issues.findIndex(
          (i) =>
            i.code === issue.code &&
            i.selector === issue.selector &&
            i.message === issue.message &&
            i.type === issue.type,
        );

        if (issueIndex !== -1) {
          const targetIssue = store.results.issues[issueIndex];
          targetIssue.learningContent = staticContent;
        }
      }
    } catch (fallbackError) {
      console.error('Failed to fetch static learning content:', fallbackError);
    }
  } finally {
    loadingLearningContent.value[loadingKey] = false;
  }
};

// Fetch AI explanation for an issue
const fetchExplanation = async (issue, index) => {
  if (!store.results) return;

  // Use a unique key for loading state (code + selector)
  const loadingKey = `${issue.code}-${issue.selector}`;
  loadingExplanations.value[loadingKey] = true;

  try {
    const explanation = await api.explainIssue(issue);

    // Update the issue in the store results
    // Find the issue in the original results array
    const issueIndex = store.results.issues.findIndex(
      (i) =>
        i.code === issue.code &&
        i.selector === issue.selector &&
        i.message === issue.message &&
        i.type === issue.type,
    );

    if (issueIndex !== -1) {
      // Directly update the issue properties (Pinia reactivity handles this)
      const targetIssue = store.results.issues[issueIndex];
      targetIssue.explanation = explanation.explanation;
      targetIssue.fix = explanation.fix;
      // Update enhanced explanation fields
      if (explanation.details) {
        targetIssue.details = explanation.details;
      }
      if (explanation.suggestions) {
        targetIssue.suggestions = explanation.suggestions;
      }
      if (explanation.codeFixes) {
        targetIssue.codeFixes = explanation.codeFixes;
      }
    }
  } catch (error) {
    console.error('Failed to fetch explanation:', error);
    // You could show an error toast here
  } finally {
    loadingExplanations.value[loadingKey] = false;
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

/* AI Explanation Animations */
.ai-explanation-content {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth transitions for interactive elements */
button {
  transition: all 0.2s ease-in-out;
}

/* Code block styling improvements */
pre {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

pre::-webkit-scrollbar {
  height: 6px;
}

pre::-webkit-scrollbar-track {
  background: transparent;
}

pre::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Markdown content styling */
.markdown-content :deep(p) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: inherit;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  transition: color 0.2s;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.25rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}
</style>
