<script setup lang="ts">
const numTestPages = parseInt(useAppConfig().numTestPages)
const activePage = computed(() => parseInt(useRoute().path.split('/').filter(p => !!p).slice(-1)[0] ?? 0))

const makePages = (activePage: number) => {
  const WINDOW = 5
  const assumedActivePage = activePage > 0 ? activePage : 1
  let pageRange = Array.from(Array(WINDOW * 2 + 1).keys())
    .map(p => p + activePage - WINDOW)
    .filter(p => p >= 1 && p <= numTestPages)
    // pad start
    if (pageRange[0] > 2) {
      pageRange = [1, -1, ...pageRange]
    } else if (pageRange[0] > 1) {
      pageRange = [1, ...pageRange]
    }
    // pad end
    if (pageRange.slice(-1)[0] < numTestPages - 1) {
      pageRange = [...pageRange, -1, numTestPages]
    } else if (pageRange.slice(-1)[0] < numTestPages) {
      pageRange = [...pageRange, numTestPages]
    }
    return pageRange
}

const navPages = computed(() => makePages(activePage.value))
</script>

<template>
  <hr>
  <p class="my-2">Pages:</p>
  <ul class="flex flex-wrap gap-1">
    <li v-for="i in navPages" :key="i">
      <NuxtLink
        v-if="i > 0"
        :to="`/test/${i}/`"
        :class="{
          'bg-green-500 font-bold': i === activePage
        }"
        class="block-link block rounded border p-0.5 w-16 text-center">
        {{ i }}
      </NuxtLink>
      <div v-else class="p-0.5 w-16 text-center rounded opacity-30">...</div>
    </li>
  </ul>
</template>

<style scoped>
.block-link {
  @apply transition no-underline;
}

.block-link:hover {
  @apply opacity-80 bg-green-500 bg-opacity-30;
}
</style>
