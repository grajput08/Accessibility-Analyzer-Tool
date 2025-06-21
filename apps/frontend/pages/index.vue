<template>
  <div class="fade-in">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 to-accent-50 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Accessibility
            <span class="text-primary-600">Analyzer</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive web accessibility analysis tool to help you create
            inclusive digital experiences. Test your websites for accessibility
            compliance and get actionable recommendations.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/analyze"
              class="btn-primary inline-flex items-center justify-center"
            >
              Start Analyzing
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
            <button
              @click="testBackendConnection"
              class="btn-secondary inline-flex items-center justify-center"
              :disabled="isTesting"
            >
              <span v-if="isTesting">Testing...</span>
              <span v-else>Test Backend</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to ensure your websites are accessible to
            everyone
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="card text-center">
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
              Comprehensive Analysis
            </h3>
            <p class="text-gray-600">
              Test for WCAG 2.1 compliance, keyboard navigation, screen reader
              compatibility, and more.
            </p>
          </div>

          <div class="card text-center">
            <div
              class="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-accent-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Real-time Testing
            </h3>
            <p class="text-gray-600">
              Get instant feedback with our real-time accessibility testing
              engine.
            </p>
            <div class="mt-3">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                Coming Soon
              </span>
            </div>
          </div>

          <div class="card text-center">
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Detailed Reports
            </h3>
            <p class="text-gray-600">
              Receive comprehensive reports with actionable recommendations and
              code examples.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Backend Status -->
    <div v-if="backendStatus" class="fixed bottom-4 right-4">
      <div
        :class="[
          'px-4 py-2 rounded-lg shadow-lg text-white text-sm',
          backendStatus.success ? 'bg-green-500' : 'bg-red-500',
        ]"
      >
        {{ backendStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const isTesting = ref(false);
const backendStatus = ref(null);

const testBackendConnection = async () => {
  isTesting.value = true;
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/`);
    backendStatus.value = {
      success: true,
      message: '✅ Backend connected successfully!',
    };
  } catch (error) {
    backendStatus.value = {
      success: false,
      message: '❌ Backend connection failed',
    };
  } finally {
    isTesting.value = false;
    // Clear status after 3 seconds
    setTimeout(() => {
      backendStatus.value = null;
    }, 3000);
  }
};
</script>
