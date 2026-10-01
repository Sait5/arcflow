<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Plus,
  Layers,
  UserRound,
  CircleDot,
  SignalHigh,
  CornerDownLeft,
} from 'lucide-vue-next'
import AppModal from './AppModal.vue'
import { useWorkspace } from '../../composables/useWorkspace'
import { projects, statuses, priorities, users } from '../../data/issues'
const router = useRouter()
const {
  paletteOpen,
  issues,
  selectedId,
  selected,
  project,
  section,
  status,
  query: taskQuery,
  createIssue,
  updateIssue,
  content,
} = useWorkspace()
const query = ref('')
const index = ref(0)
const mode = ref('root')
function commandTitle(value: string) {
  return ['search', 'assign'].includes(mode.value) ||
    (mode.value === 'project' && value !== 'All projects')
    ? content(value)
    : t(value)
}
function resetCommands() {
  mode.value = 'root'
  query.value = ''
  index.value = 0
}
const commands = [
  { id: 'create', title: 'Create issue', subtitle: 'Turn an idea into your next step', icon: Plus },
  {
    id: 'search',
    title: 'Search workspace',
    subtitle: 'Find the work you’re looking for',
    icon: Search,
  },
  {
    id: 'project',
    title: 'Change project',
    subtitle: 'A new perspective on your work',
    icon: Layers,
  },
  {
    id: 'assign',
    title: 'Assign issue',
    subtitle: 'Find the right person for the job',
    icon: UserRound,
  },
  { id: 'status', title: 'Change status', subtitle: 'Keep your team in the loop', icon: CircleDot },
  {
    id: 'priority',
    title: 'Set priority',
    subtitle: 'Focus on what matters most',
    icon: SignalHigh,
  },
]
const options = computed(() => {
  let list: { id: string; title: string; subtitle: string; icon: typeof Plus }[] = commands
  if (mode.value === 'project')
    list = [
      { id: 'all', title: 'All projects', subtitle: 'Your complete workspace', icon: Layers },
      ...projects.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: 'Switch project',
        icon: Layers,
      })),
    ]
  if (mode.value === 'status')
    list = statuses.map((s) => ({
      id: s,
      title: s,
      subtitle: selected.value?.title || 'Update the latest issue',
      icon: CircleDot,
    }))
  if (mode.value === 'priority')
    list = priorities.map((p) => ({
      id: p,
      title: p,
      subtitle: selected.value?.title || 'Update the latest issue',
      icon: SignalHigh,
    }))
  if (mode.value === 'assign')
    list = users.map((u) => ({
      id: u.id,
      title: u.name,
      subtitle: selected.value?.title || 'Assign the latest issue',
      icon: UserRound,
    }))
  if (mode.value === 'search')
    list = issues.value.map((i) => ({
      id: i.id,
      title: i.title,
      subtitle: i.id + ' · ' + t(i.status),
      icon: CircleDot,
    }))
  return list.filter((c) =>
    `${commandTitle(c.title)} ${t(c.subtitle)} ${c.title}`
      .toLowerCase()
      .includes(query.value.toLowerCase()),
  )
})
watch(paletteOpen, (open) => {
  if (open) {
    query.value = ''
    mode.value = 'root'
    index.value = 0
  }
})
watch(query, () => (index.value = 0))
function key(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    paletteOpen.value = !paletteOpen.value
  }
}
onMounted(() => document.addEventListener('keydown', key))
onBeforeUnmount(() => document.removeEventListener('keydown', key))
async function choose(id: string) {
  if (mode.value === 'root') {
    mode.value = id
    query.value = ''
    index.value = 0
    return
  }
  if (mode.value === 'project') {
    project.value = id
    section.value = 'All issues'
    status.value = 'all'
    taskQuery.value = ''
    await router.push('/workspace')
  } else if (mode.value === 'search') {
    selectedId.value = id
    await router.push('/workspace')
  } else {
    if (!selected.value) selectedId.value = issues.value[0]?.id ?? null
    if (selected.value) {
      if (mode.value === 'status')
        await updateIssue(selected.value.id, { status: id as typeof selected.value.status })
      if (mode.value === 'priority')
        await updateIssue(selected.value.id, { priority: id as typeof selected.value.priority })
      if (mode.value === 'assign') await updateIssue(selected.value.id, { assignee: id })
    }
  }
  paletteOpen.value = false
}
async function create() {
  if (!query.value.trim()) return
  if (!(await createIssue(query.value.trim()))) return
  paletteOpen.value = false
  await router.push('/workspace')
}
function navigate(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    index.value = (index.value + 1) % Math.max(options.value.length, 1)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    index.value = (index.value - 1 + options.value.length) % Math.max(options.value.length, 1)
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    if (mode.value === 'create') create()
    else if (options.value[index.value]) choose(options.value[index.value]!.id)
  }
}
</script>
<template>
  <AppModal
    v-if="paletteOpen"
    :title="
      t(
        mode === 'root'
          ? 'Command menu'
          : commands.find((c) => c.id === mode)?.title || 'Command menu',
      )
    "
    @close="paletteOpen = false"
    ><div class="command-search">
      <Search :size="20" /><input
        v-model="query"
        :placeholder="t(mode === 'create' ? 'Name your new issue…' : 'What would you like to do?')"
        :aria-label="t('Search commands')"
        role="combobox"
        :aria-expanded="true"
        aria-controls="command-options"
        :aria-activedescendant="options[index] ? `command-${index}` : undefined"
        @keydown="navigate"
      /><kbd>{{ t('ESC') }}</kbd>
    </div>
    <div class="command-options" id="command-options" role="listbox">
      <template v-if="mode !== 'create'"
        ><button
          v-for="(command, i) in options"
          :id="`command-${i}`"
          :key="command.id"
          role="option"
          :aria-selected="index === i"
          :class="{ selected: index === i }"
          @mouseenter="index = i"
          @click="choose(command.id)"
        >
          <component :is="command.icon" :size="18" /><span
            ><strong>{{ commandTitle(command.title) }}</strong
            ><small>{{ t(command.subtitle) }}</small></span
          ><CornerDownLeft v-if="index === i" :size="14" />
        </button>
        <div v-if="!options.length" class="empty-state">
          {{ t('No matching commands. Try another search.') }}
        </div></template
      >
      <div v-else class="command-create">
        <p>{{ t('A small idea can become something great.') }}</p>
        <button class="button" :disabled="!query.trim()" @click="create">
          {{ t('Create issue') }} <Plus :size="14" />
        </button>
      </div>
    </div>
    <footer class="command-footer">
      <button v-if="mode !== 'root'" @click="resetCommands">{{ t('← All commands') }}</button
      ><span v-else
        >{{ t('Arcflow') }}
        <span class="muted">{{ t('· Everything, one shortcut away') }}</span></span
      ><span><kbd>↑</kbd><kbd>↓</kbd> {{ t('navigate') }} <kbd>↵</kbd> {{ t('select') }}</span>
    </footer></AppModal
  >
</template>
