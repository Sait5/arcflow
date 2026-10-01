<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { computed } from 'vue'
import { CircleDot, ChevronDown, MoreHorizontal } from 'lucide-vue-next'
import { useWorkspace } from '../../composables/useWorkspace'
const { issues } = useWorkspace()
const completed = computed(() => issues.value.filter((i) => i.status === 'Done').length)
</script>
<template>
  <div class="cycle-chart">
    <div class="cycle-chart-header">
      <span>{{ t('Cycle 24') }} <ChevronDown :size="12" /></span
      ><span class="cycle-chart-badge">{{ t('Current') }}</span
      ><MoreHorizontal :size="16" />
    </div>
    <div class="cycle-chart-body">
      <div class="cycle-chart-plot">
        <div class="plot-labels">
          <span>{{ t('Oct 14') }}</span
          ><span>{{ t('Oct 7') }}</span
          ><span>{{ t('Oct 1') }}</span>
        </div>
        <svg
          viewBox="0 0 600 250"
          role="img"
          :aria-label="t('Cycle scope, started, and completed work over two weeks')"
        >
          <defs>
            <linearGradient id="cycle-shading" x1="0" y1="0" x2="0" y2="1">
              <stop stop-color="#8076d4" stop-opacity=".16" />
              <stop offset="1" stop-color="#8076d4" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 40H600M0 105H600M0 170H600M0 235H600" stroke="#ffffff0b" />
          <path
            d="M0 236 52 220 109 225 163 219 219 195 272 202 328 182 383 183 441 159 495 146 551 89 600 36V250H0Z"
            fill="url(#cycle-shading)"
          />
          <path
            d="M0 236 52 220 109 225 163 219 219 195 272 202 328 182 383 183 441 159 495 146 551 89 600 36"
            fill="none"
            stroke="#7e77ce"
            stroke-width="2"
          />
          <path d="M0 236C140 170 260 133 600 22" fill="none" stroke="#b9ac87" stroke-width="1.5" />
          <path d="M0 235Q260 40 600 12" fill="none" stroke="#848b9f" stroke-dasharray="4 4" />
          <circle cx="600" cy="36" r="4" fill="#aaa1f3" />
        </svg>
        <div class="plot-dates">
          <span>{{ t('Oct 1') }}</span
          ><span>{{ t('Oct 7') }}</span
          ><span>{{ t('Oct 14') }}</span>
        </div>
      </div>
      <div class="cycle-chart-stats">
        <span
          ><i class="scope"></i>{{ t('Scope') }} <strong>{{ t(issues.length) }}</strong></span
        ><span
          ><i class="started"></i>{{ t('Started') }}
          <strong>{{ t(issues.filter((i) => i.status !== 'Backlog').length) }}</strong></span
        ><span
          ><i class="completed"></i>{{ t('Completed') }} <strong>{{ t(completed) }}</strong></span
        >
        <div class="cycle-chart-velocity">
          <strong
            >{{ t(issues.length ? Math.round((completed / issues.length) * 100) : 0) }}%</strong
          >
          <small>{{ t('work completed') }}</small>
        </div>
      </div>
    </div>
    <div class="cycle-chart-next">
      <CircleDot :size="12" /><span>{{ t('Next cycle') }}</span
      ><span>{{ t('Oct 15 – Oct 28') }}</span>
    </div>
  </div>
</template>
