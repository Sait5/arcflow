<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { computed } from 'vue'
import type { Issue } from '../../data/issues'
import { statuses } from '../../data/issues'
import StatusIcon from '../ui/StatusIcon.vue'
import IssueRow from './IssueRow.vue'
const props = defineProps<{ issues: Issue[]; preview?: boolean }>()
defineEmits<{ open: [id: string] }>()
const groups = computed(() =>
  statuses
    .map((status) => ({ status, issues: props.issues.filter((i) => i.status === status) }))
    .filter((g) => g.issues.length),
)
</script>
<template>
  <div class="issue-list">
    <template v-for="group in groups" :key="group.status"
      ><div class="issue-group">
        <StatusIcon :status="group.status" /><strong>{{ t(group.status) }}</strong
        ><span>{{ t(group.issues.length) }}</span
        ><span class="group-line"></span><span>···</span>
      </div>
      <IssueRow
        v-for="issue in group.issues"
        :key="issue.id"
        :issue="issue"
        @open="$emit('open', $event)"
    /></template>
    <div v-if="!issues.length" class="empty-state">
      <span>{{ t('Nothing here. A little room to breathe.') }}</span
      ><small>{{ t('Try a different search or filter.') }}</small>
    </div>
  </div>
</template>
