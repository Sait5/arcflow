<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { computed } from 'vue'
import { ChevronDown, MoreHorizontal, CircleDot, UsersRound, Flag, Diamond } from 'lucide-vue-next'
import { useWorkspace } from '../../composables/useWorkspace'
const { issues } = useWorkspace()
const completed = computed(() => issues.value.filter((i) => i.status === 'Done').length)
</script>
<template>
  <aside class="preview-insights">
    <header><span class="insight-project">◇</span><MoreHorizontal :size="14" /></header>
    <h3>{{ t('Website v2') }}</h3>
    <p>{{ t('A thoughtful next chapter for the product experience.') }}</p>
    <div class="insight-properties">
      <small>{{ t('Properties') }}</small
      ><span><CircleDot :size="11" /> {{ t('In Progress') }}</span
      ><span><UsersRound :size="11" /> {{ t('Alex Morgan') }}</span
      ><span><Flag :size="11" /> {{ t('Oct 24') }}</span
      ><span><Diamond :size="11" /> {{ t('Product team') }}</span>
    </div>
    <div class="insight-documents">
      <small>{{ t('Resources') }}</small
      ><span>{{ t('▤ Project brief') }} <ChevronDown :size="10" /></span
      ><span>{{ t('▤ Design exploration') }}</span>
    </div>
    <div class="insight-progress">
      <small>{{ t('Progress') }}</small
      ><strong
        >{{ t(completed) }} {{ t('of') }} {{ t(issues.length) }} {{ t('issues completed') }}</strong
      ><svg viewBox="0 0 180 85" :aria-label="t('Project progress chart')" role="img">
        <path d="M0 70H180M0 40H180M0 10H180" stroke="#ffffff08" />
        <path d="M0 78 24 75 48 63 74 66 95 46 120 48 145 27 180 18" stroke="#a1a4ad" fill="none" />
        <path d="M0 82 24 81 48 72 74 74 95 65 120 67 145 49 180 38V85H0Z" fill="#7770c91b" />
        <path d="M0 82 24 81 48 72 74 74 95 65 120 67 145 49 180 38" stroke="#7c74c7" fill="none" />
      </svg>
    </div>
  </aside>
</template>
