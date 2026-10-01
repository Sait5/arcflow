<script setup lang="ts">
import type { Status } from '../../data/issues'
defineProps<{ status: Status }>()
</script>
<template>
  <span class="status-dot" :class="status.toLowerCase().replaceAll(' ', '-')" aria-hidden="true"
    ><span v-if="status === 'Done'">✓</span></span
  >
</template>
