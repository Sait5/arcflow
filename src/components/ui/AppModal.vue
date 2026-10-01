<script lang="ts">
let activeDialogs = 0
let savedOverflow = ''
let savedInert = false
</script>
<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { X } from 'lucide-vue-next'
const { t } = useLocale()
defineProps<{ title: string; wide?: boolean; drawer?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const root = ref<HTMLElement>()
const previous = document.activeElement as HTMLElement | null
const app = document.getElementById('app')
function key(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.stopImmediatePropagation()
    emit('close')
  }
  if (event.key === 'Tab') {
    const nodes = root.value?.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, a[href], [tabindex="0"]',
    )
    if (!nodes?.length) return
    const first = nodes[0]!
    const last = nodes[nodes.length - 1]!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}
onMounted(async () => {
  if (activeDialogs === 0) {
    savedOverflow = document.body.style.overflow
    savedInert = app?.inert ?? false
  }
  activeDialogs++
  document.body.style.overflow = 'hidden'
  if (app) app.inert = true
  document.addEventListener('keydown', key, true)
  await nextTick()
  ;(
    (root.value?.querySelector('input') || root.value?.querySelector('button')) as HTMLElement
  )?.focus()
})
onBeforeUnmount(() => {
  activeDialogs--
  document.removeEventListener('keydown', key, true)
  if (activeDialogs === 0) {
    document.body.style.overflow = savedOverflow
    if (app) app.inert = savedInert
    previous?.focus()
  }
})
</script>
<template>
  <Teleport to="body"
    ><div
      class="modal-backdrop"
      :class="{ 'drawer-backdrop': drawer }"
      @mousedown.self="emit('close')"
    >
      <section
        ref="root"
        class="modal-panel"
        :class="{ wide, 'drawer-panel': drawer }"
        role="dialog"
        aria-modal="true"
        :aria-label="t(title)"
      >
        <header class="modal-heading">
          <span>{{ t(title) }}</span
          ><button class="icon-button" :aria-label="t('Close dialog')" @click="emit('close')">
            <X :size="18" />
          </button>
        </header>
        <slot />
      </section></div
  ></Teleport>
</template>
