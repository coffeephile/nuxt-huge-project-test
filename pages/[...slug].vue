<template>
  <main class="p-3">
    <ContentDoc>
      <template #not-found>
        Doc not found 🥺<br />
        <nuxt-link to="/"> ← Go back home </nuxt-link>
      </template>
    </ContentDoc>
  </main>
</template>
