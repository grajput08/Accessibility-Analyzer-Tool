<template>
  <div class="fade-in">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-24 overflow-hidden">
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center">
          <div class="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            WCAG 2.1 Compliant Testing
          </div>
          <h1 class="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Make Your Website
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
              Accessible
            </span>
            to Everyone
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Comprehensive web accessibility analysis tool that helps you create inclusive digital experiences. 
            Test your websites for WCAG compliance and get AI-powered recommendations.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NuxtLink
              to="/analyze"
              class="btn-primary inline-flex items-center justify-center text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Start Free Analysis
              <svg
                class="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="btn-secondary inline-flex items-center justify-center text-lg px-8 py-4"
            >
              Learn More
            </NuxtLink>
          </div>
          <div class="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              No Credit Card Required
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Instant Results
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Privacy First
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-white border-y border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-primary-600 mb-2">WCAG 2.1</div>
            <div class="text-gray-600">Compliance Testing</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-accent-600 mb-2">AI-Powered</div>
            <div class="text-gray-600">Explanations</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-green-600 mb-2">100%</div>
            <div class="text-gray-600">Free to Use</div>
          </div>
          <div class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-purple-600 mb-2">Instant</div>
            <div class="text-gray-600">Results</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive accessibility testing with detailed insights and actionable recommendations
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card text-center hover:scale-105 transition-transform">
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              WCAG Compliance Testing
            </h3>
            <p class="text-gray-600">
              Test against WCAG 2.0 Level A, AA, and AAA standards with comprehensive analysis of all accessibility criteria.
            </p>
          </div>

          <div class="card text-center hover:scale-105 transition-transform">
            <div
              class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              AI-Powered Explanations
            </h3>
            <p class="text-gray-600">
              Get intelligent explanations for each issue, helping you understand why it matters and how to fix it.
            </p>
          </div>

          <div class="card text-center hover:scale-105 transition-transform">
            <div
              class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Detailed Reports
            </h3>
            <p class="text-gray-600">
              Receive comprehensive reports with actionable recommendations, code examples, and fix suggestions.
            </p>
          </div>

          <div class="card text-center hover:scale-105 transition-transform">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Learning Mode
            </h3>
            <p class="text-gray-600">
              Educational content for each issue type, helping you understand accessibility principles and best practices.
            </p>
          </div>

          <div class="card text-center hover:scale-105 transition-transform">
            <div
              class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Code Fixes
            </h3>
            <p class="text-gray-600">
              Get ready-to-use code snippets and fix suggestions for each accessibility issue found.
            </p>
          </div>

          <div class="card text-center hover:scale-105 transition-transform">
            <div
              class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Privacy & Security
            </h3>
            <p class="text-gray-600">
              Your data is never stored. All analyses are performed securely and results are only available to you.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Get comprehensive accessibility analysis in just three simple steps
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="relative inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
              <span class="text-3xl font-bold text-primary-600">1</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Enter Your URL</h3>
            <p class="text-gray-600">
              Simply paste the URL of the website you want to analyze. No registration or setup required.
            </p>
          </div>

          <div class="text-center">
            <div class="relative inline-flex items-center justify-center w-20 h-20 bg-accent-100 rounded-full mb-6">
              <span class="text-3xl font-bold text-accent-600">2</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Choose Standards</h3>
            <p class="text-gray-600">
              Select your preferred WCAG compliance level (A, AA, or AAA) and configure analysis options.
            </p>
          </div>

          <div class="text-center">
            <div class="relative inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <span class="text-3xl font-bold text-green-600">3</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Get Results</h3>
            <p class="text-gray-600">
              Receive detailed reports with AI explanations, code fixes, and learning resources for each issue.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Make Your Website Accessible?
        </h2>
        <p class="text-xl text-primary-100 mb-8">
          Start analyzing your website today and get instant accessibility insights
        </p>
        <NuxtLink
          to="/analyze"
          class="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:-translate-y-0.5 transition-all shadow-lg"
        >
          Start Free Analysis
          <svg
            class="ml-2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            ></path>
          </svg>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
</script>

<style scoped>
.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
