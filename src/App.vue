<script setup lang="ts">
import { useLocale } from './composables/useLocale'
const { t } = useLocale()
import { defineAsyncComponent } from 'vue'
import { useWorkspace } from './composables/useWorkspace'
const CommandPalette = defineAsyncComponent(() => import('./components/ui/CommandPalette.vue'))
const IssueDrawer = defineAsyncComponent(() => import('./components/workspace/IssueDrawer.vue'))
const { toast, paletteOpen } = useWorkspace()
</script>
<template>
  <RouterView v-slot="{ Component }"
    ><Transition name="page" mode="out-in"><component :is="Component" /></Transition></RouterView
  ><CommandPalette /><IssueDrawer v-if="!paletteOpen" /><Transition name="toast"
    ><div v-if="toast" class="toast-notification" role="status">
      <span class="live-dot"></span>{{ t(toast) }}
    </div></Transition
  >
</template>
