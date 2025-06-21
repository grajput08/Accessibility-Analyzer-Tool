<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// App-level setup
useHead({
  title: "Accessibility Analyzer Tool",
  meta: [
    {
      name: "description",
      content:
        "Analyze and improve web accessibility with our comprehensive tool",
    },
  ],
});
</script>

<style lang="scss">
// Global styles are imported from main.scss
</style>
