<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { Check, ArrowUpRight } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import type { Issue } from '../../data/issues'
import { useWorkspace } from '../../composables/useWorkspace'
import { statuses, priorities, users, projects } from '../../data/issues'
import AppModal from '../ui/AppModal.vue'
import StatusIcon from '../ui/StatusIcon.vue'
const { selected, selectedId, updateIssue, deleteIssue, activeTeam, notify, content } =
  useWorkspace()
const busy = ref(false)
const editing = ref(false)
const removing = ref(false)
const title = ref('')
const description = ref('')
const editingVersion = ref<number>()
function beginEdit() {
  if (!selected.value) return
  editing.value = true
  title.value = selected.value.title
  description.value = selected.value.description
  editingVersion.value = selected.value.version
}
watch(
  () => selected.value?.id,
  () => {
    editing.value = false
    removing.value = false
    title.value = selected.value?.title || ''
    description.value = selected.value?.description || ''
  },
)
async function change(field: keyof Issue, event: Event) {
  if (!selected.value) return
  busy.value = true
  await updateIssue(selected.value.id, { [field]: (event.target as HTMLSelectElement).value })
  busy.value = false
}
async function save() {
  if (!selected.value) return
  busy.value = true
  if (
    await updateIssue(selected.value.id, {
      title: title.value,
      description: description.value,
      version: editingVersion.value,
    })
  )
    editing.value = false
  else editingVersion.value = selected.value?.version
  busy.value = false
}
async function remove() {
  if (!selected.value) return
  busy.value = true
  try {
    await deleteIssue(selected.value.id)
  } catch {
    notify('server_unavailable')
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <AppModal
    v-if="selected"
    :title="selected.id + ' · ' + t('Issue details')"
    wide
    drawer
    @close="selectedId = null"
    ><div class="issue-detail">
      <div class="detail-breadcrumb">
        <span>{{ content(activeTeam?.name || 'Arcflow Product') }}</span
        ><span>/</span><span>{{ selected.id }}</span>
      </div>
      <form v-if="editing" class="create-form" @submit.prevent="save">
        <label>{{ t('Issue title') }}<input v-model="title" maxlength="200" required /></label
        ><label
          >{{ t('Description')
          }}<textarea v-model="description" maxlength="8000" rows="5"></textarea></label
        ><button class="button" :disabled="busy">{{ t('Save changes') }}</button>
      </form>
      <template v-else
        ><h2>{{ content(selected.title) }}</h2>
        <p>{{ selected.description ? content(selected.description) : t('No description yet.') }}</p>
        <button class="team-action" @click="beginEdit">{{ t('Edit task') }}</button></template
      >
      <div class="detail-properties">
        <label
          ><span>{{ t('Status') }}</span>
          <div class="select-with-icon">
            <StatusIcon :status="selected.status" /><select
              :value="selected.status"
              :disabled="busy"
              :aria-label="t('Issue status')"
              @change="change('status', $event)"
            >
              <option v-for="s in statuses" :key="s" :value="s">{{ t(s) }}</option>
            </select>
          </div></label
        ><label
          ><span>{{ t('Priority') }}</span
          ><select
            :value="selected.priority"
            :disabled="busy"
            :aria-label="t('Issue priority')"
            @change="change('priority', $event)"
          >
            <option v-for="p in priorities" :key="p" :value="p">{{ t(p) }}</option>
          </select></label
        ><label
          ><span>{{ t('Assignee') }}</span
          ><select
            :value="selected.assignee"
            :disabled="busy"
            :aria-label="t('Issue assignee')"
            @change="change('assignee', $event)"
          >
            <option value="">{{ t('Unassigned') }}</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ t(u.name) }}</option>
          </select></label
        ><label
          ><span>{{ t('Project') }}</span
          ><select
            :value="selected.project"
            :disabled="busy"
            :aria-label="t('Issue project')"
            @change="change('project', $event)"
          >
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ content(p.name) }}</option>
          </select></label
        ><label
          ><span>{{ t('Labels') }}</span
          ><span class="tag">{{ t(selected.labels.join(', ')) }}</span></label
        >
      </div>
      <div class="detail-activity">
        <span class="avatar lavender">{{
          users.find((u) => u.id === selected?.assignee)?.initials || '—'
        }}</span>
        <div>
          <strong>{{ t('Ready for the next step.') }}</strong
          ><small>{{
            t(activeTeam ? 'Changes are shared with your team.' : 'This is an interactive demo.')
          }}</small>
        </div>
        <Check :size="16" />
      </div>
      <button class="button button-secondary" @click="selectedId = null">
        {{ t('Back to workspace') }} <ArrowUpRight :size="14" />
      </button>
    </div>
    <div class="delete-task">
      <button v-if="!removing" class="team-action danger" @click="removing = true">
        {{ t('Delete task') }}</button
      ><template v-else
        ><p>{{ t('Delete this task for everyone in the team?') }}</p>
        <button class="button danger" :disabled="busy" @click="remove">
          {{ t('Confirm deletion') }}</button
        ><button class="team-action" @click="removing = false">{{ t('Cancel') }}</button></template
      >
    </div></AppModal
  >
</template>
