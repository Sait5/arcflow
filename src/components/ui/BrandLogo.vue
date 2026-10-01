<script setup lang="ts">
defineProps<{ compact?: boolean }>()
</script>
<template>
  <span class="brand"
    ><svg width="27" height="27" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5 26 16 5l11 21h-6L16 15l-5 11H5Z" fill="currentColor" />
      <path d="m14 24 2-4 2 4h-4Z" fill="currentColor" /></svg
    ><span v-if="!compact">Arcflow</span></span
  >
</template>
