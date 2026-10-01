<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import FeatureCard from './FeatureCard.vue'
import { useReveal } from '../../composables/useMotion'
const reveal = useReveal()
const cards = [
  {
    kind: 'issues' as const,
    title: 'Issue tracking',
    description: 'Less managing tasks. More making progress. Keep every detail in the right place.',
  },
  {
    kind: 'planning' as const,
    title: 'Project planning',
    description:
      'Connect today’s work to tomorrow’s vision. Give your best ideas a clear direction.',
  },
  {
    kind: 'velocity' as const,
    title: 'Team velocity',
    description: 'See the momentum, not just the numbers. Build a rhythm that works for your team.',
  },
]
</script>
<template>
  <section id="features" class="features section container">
    <div class="section-heading" v-motion="reveal">
      <span class="eyebrow"><span class="label-dot"></span> {{ t('PURPOSEFULLY CONNECTED') }}</span>
      <div class="heading-split">
        <h2>{{ t('Everything your team needs') }}<br />{{ t('to move forward.') }}</h2>
        <p>
          {{ t('One shared space for the work that matters.') }}<br />{{
            t('Thoughtfully built, from the big picture')
          }}<br class="desktop-break" />
          {{ t('to the smallest detail.') }}
        </p>
      </div>
    </div>
    <div class="feature-grid">
      <FeatureCard
        v-for="(card, i) in cards"
        :key="card.kind"
        v-bind="card"
        :number="`0${i + 1}`"
        v-motion="useReveal(i * 100)"
      />
    </div>
  </section>
</template>
