<script setup lang="ts">
const nuxtApp = useNuxtApp()
const router = useRouter()

const timeStart = ref(-1)

router.beforeEach(() => {
  timeStart.value = performance.now()
})

nuxtApp.hook('page:finish', () => {
  const loadingTime = performance.now() - timeStart.value
  console.log(`Loading time (ms):`, loadingTime)
})
</script>

<template>
  <div class="hidden">🤫</div>
</template>
