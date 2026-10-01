<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Lightbulb, Circle, CircleDot, ScanEye, Check } from 'lucide-vue-next'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useReveal } from '../../composables/useMotion'
const root = ref<HTMLElement>()
const started = ref(false)
const reveal = useReveal()
const reduced = usePreferredReducedMotion()
let observer: IntersectionObserver
const steps = [
  { title: 'Idea', text: 'Start with a spark', icon: Lightbulb },
  { title: 'Todo', text: 'Give it direction', icon: Circle },
  { title: 'In Progress', text: 'Make it happen', icon: CircleDot },
  { title: 'Review', text: 'Make it better', icon: ScanEye },
  { title: 'Released', text: 'Send it into the world', icon: Check },
]
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        started.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.3 },
  )
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <section id="method" ref="root" class="workflow container section" v-motion="reveal">
    <div class="workflow-heading">
      <span class="eyebrow"><span class="label-dot"></span> {{ t('A NATURAL WAY TO WORK') }}</span>
      <h2>{{ t('From idea to shipped.') }}</h2>
      <p>{{ t('Good work has a rhythm. Find yours.') }}</p>
    </div>
    <div class="workflow-track" :class="{ started, reduced: reduced === 'reduce' }">
      <div class="workflow-line"></div>
      <div v-for="(step, i) in steps" :key="step.title" class="workflow-step" :class="`step-${i}`">
        <div class="workflow-icon"><component :is="step.icon" :size="19" /></div>
        <strong>{{ t(step.title) }}</strong
        ><small>{{ t(step.text) }}</small>
      </div>
    </div>
  </section>
</template>
