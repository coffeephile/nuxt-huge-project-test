<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <PerformanceObserver />
  </ClientOnly>
</template>

<style>
a {
  @apply underline transition;
}

a:hover {
  @apply opacity-60;
}
</style>
