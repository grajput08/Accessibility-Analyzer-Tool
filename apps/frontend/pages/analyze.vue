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
            recommendations using our Pa11y-powered analysis engine
          </p>
        </div>
      </div>
    </section>

    <!-- Analysis Component -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AccessibilityAnalyzer />
      </div>
    </section>
  </div>
</template>

<script setup>
// The AccessibilityAnalyzer component handles all the analysis logic
</script>
