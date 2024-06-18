<template>
  <main class="p-3">
    <FixedHeightBlock>
      Top page here!
    </FixedHeightBlock>
    <TestPageLinks />
  </main>
</template>

<style scoped>
.block-link {
  @apply transition no-underline;
}

.block-link:hover {
  @apply opacity-80 bg-green-500 bg-opacity-30;
}
</style>
