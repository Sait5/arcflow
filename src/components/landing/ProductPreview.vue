<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ref, defineAsyncComponent } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
const WorkspaceDashboard = defineAsyncComponent(() => import('../workspace/WorkspaceDashboard.vue'))
const root = ref<HTMLElement>()
const reduced = usePreferredReducedMotion()
function move(e: MouseEvent) {
  if (reduced.value === 'reduce' || !matchMedia('(hover: hover)').matches || !root.value) return
  const box = root.value.getBoundingClientRect()
  const x = (e.clientX - box.left) / box.width - 0.5
  const y = (e.clientY - box.top) / box.height - 0.5
  root.value.style.setProperty('--rx', `${-y * 1.3}deg`)
  root.value.style.setProperty('--ry', `${x * 1.3}deg`)
  root.value.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`)
}
function reset() {
  root.value?.style.setProperty('--rx', '0deg')
  root.value?.style.setProperty('--ry', '0deg')
}
</script>
<template>
  <div ref="root" class="product-preview" @mousemove="move" @mouseleave="reset">
    <div class="preview-glow"></div>
    <div class="preview-window">
      <div class="window-chrome">
        <div class="window-dots"><i></i><i></i><i></i></div>
        <span>{{ t('arcflow.app / workspace') }}</span
        ><span class="window-secure">↗</span>
      </div>
      <WorkspaceDashboard preview />
    </div>
    <div class="preview-fade"></div>
  </div>
</template>
