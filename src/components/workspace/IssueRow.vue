<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { SignalHigh, SignalMedium, SignalLow, AlertCircle } from 'lucide-vue-next'
import type { Issue } from '../../data/issues'
import { users } from '../../data/issues'
import StatusIcon from '../ui/StatusIcon.vue'
import { useWorkspace } from '../../composables/useWorkspace'
const { content } = useWorkspace()
defineProps<{ issue: Issue }>()
defineEmits<{ open: [id: string] }>()
const icons = { High: SignalHigh, Medium: SignalMedium, Low: SignalLow, Urgent: AlertCircle }
</script>
<template>
  <button class="issue-row" @click="$emit('open', issue.id)">
    <component
      :is="icons[issue.priority]"
      :size="14"
      class="priority-icon"
      :class="{ urgent: issue.priority === 'Urgent' }"
    /><span class="issue-id">{{ t(issue.id) }}</span
    ><StatusIcon :status="issue.status" /><span class="issue-title">{{ content(issue.title) }}</span
    ><span class="issue-label">{{ t(issue.labels[0]) }}</span
    ><span
      class="avatar"
      :class="users.find((u) => u.id === issue.assignee)?.color"
      :title="t(users.find((u) => u.id === issue.assignee)?.name)"
      >{{ t(users.find((u) => u.id === issue.assignee)?.initials) }}</span
    >
  </button>
</template>
