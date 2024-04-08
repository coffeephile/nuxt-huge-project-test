<script setup lang="ts">
const numTestPages = useAppConfig().numTestPages
</script>

<template>
  <main class="p-3">
    <ul class="flex flex-wrap gap-3">
      <li v-for="i in numTestPages-1" :key="i">
        <NuxtLink :to="`/test/${i}/`">{{ i }}
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
