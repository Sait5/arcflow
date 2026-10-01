<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ArrowUpRight, SignalHigh, Check, MoreHorizontal } from 'lucide-vue-next'
defineProps<{
  kind: 'issues' | 'planning' | 'velocity'
  title: string
  description: string
  number: string
}>()
</script>
<template>
  <article class="feature-card">
    <div class="feature-visual">
      <template v-if="kind === 'issues'"
        ><div class="mini-issue-top">
          <span>{{ t('Product / Active issues') }}</span
          ><MoreHorizontal :size="14" />
        </div>
        <div
          class="mini-issue"
          v-for="(issue, i) in [
            'Refine the little things',
            'Make room for big ideas',
            'Ship something that matters',
          ]"
          :key="issue"
        >
          <SignalHigh :size="12" /><span
            class="status-dot"
            :class="i === 0 ? 'in-progress' : i === 2 ? 'done' : 'todo'"
            ><Check v-if="i === 2" :size="8" /></span
          ><span>{{ t(issue) }}</span
          ><span class="mini-avatar" :class="['lavender', 'sand', 'sage'][i]"></span>
        </div>
        <div class="mini-issue-overlay">
          <Check :size="12" /> {{ t('One less thing on your mind.') }}
        </div></template
      ><template v-if="kind === 'planning'"
        ><div class="timeline-months">
          <span>{{ t('JUN') }}</span
          ><span>{{ t('JUL') }}</span
          ><span>{{ t('AUG') }}</span
          ><span>{{ t('SEP') }}</span>
        </div>
        <div class="timeline-grid">
          <div class="timeline-bar bar-one">
            <span>◇</span> {{ t('Website v2') }} <span class="bar-dot"></span>
          </div>
          <div class="timeline-bar bar-two"><span>◇</span> {{ t('Mobile experience') }}</div>
          <div class="timeline-bar bar-three"><span>◇</span> {{ t('Design system') }}</div>
          <div class="timeline-now"><i></i></div>
        </div>
        <div class="timeline-caption">
          <span class="live-dot"></span> {{ t('The big picture, beautifully clear.') }}
        </div></template
      ><template v-if="kind === 'velocity'"
        ><div class="chart-heading">
          <div>
            <small>{{ t('Cycle progress') }}</small
            ><strong>94<span>%</span></strong>
          </div>
          <span class="chart-change">↗ 18.6%</span>
        </div>
        <svg
          class="velocity-chart"
          viewBox="0 0 320 110"
          role="img"
          :aria-label="t('Cycle progress increasing to 94 percent')"
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop stop-color="#8982df" stop-opacity=".22" />
              <stop offset="1" stop-color="#8982df" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 25H320M0 55H320M0 85H320" stroke="#ffffff0b" stroke-dasharray="3 4" />
          <path
            d="M0 100 24 90 50 94 78 72 104 76 130 55 157 60 185 40 213 47 242 26 266 30 295 10 320 5V110H0Z"
            fill="url(#chart-fill)"
          />
          <path
            d="M0 100 24 90 50 94 78 72 104 76 130 55 157 60 185 40 213 47 242 26 266 30 295 10 320 5"
            stroke="#9992e9"
            stroke-width="2"
            fill="none"
          />
        </svg>
        <div class="chart-axis">
          <span>{{ t('Week 1') }}</span
          ><span>{{ t('Week 2') }}</span
          ><span>{{ t('Week 3') }}</span
          ><span>{{ t('Week 4') }}</span>
        </div></template
      >
    </div>
    <div class="feature-copy">
      <span class="feature-number">{{ t(number) }}</span>
      <h3>{{ t(title) }}<ArrowUpRight :size="17" /></h3>
      <p>{{ t(description) }}</p>
    </div>
  </article>
</template>
