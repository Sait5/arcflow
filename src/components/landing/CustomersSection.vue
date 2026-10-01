<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { useReveal } from '../../composables/useMotion'
const reveal = useReveal()
const teams = [
  'meridian',
  'HEX',
  'Northstar',
  'capsule',
  'orbit',
  'SUNDIAL',
  'MERCURY',
  'altitude',
  'remote',
  'ARC',
  'Waypoint',
  'runway',
]
const symbols = ['↗', '', '▲', '▤', '◉', '▧', '◈', '△', '⌁', '⌘', '◇', '▥']
</script>
<template>
  <section id="customers" class="customers container" v-motion="reveal">
    <p>
      {{ t('A shared home for teams with a vision.') }}<br /><span>{{
        t('From the first idea to the next big release.')
      }}</span>
    </p>
    <div class="customer-logos" :aria-label="t('Illustrative customer teams')">
      <span v-for="(team, i) in teams" :key="team"
        ><i>{{ t(symbols[i]) }}</i
        >{{ t(team) }}</span
      >
    </div>
    <small class="customer-disclaimer">{{
      t('Illustrative teams for this product concept')
    }}</small>
  </section>
</template>
