<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ref, computed } from 'vue'
import {
  Menu,
  SlidersHorizontal,
  Plus,
  Search,
  LayoutList,
  Columns3,
  ArrowUpRight,
} from 'lucide-vue-next'
import WorkspaceSidebar from './WorkspaceSidebar.vue'
import IssueList from './IssueList.vue'
import WorkspaceOverview from './WorkspaceOverview.vue'
import PreviewInsights from './PreviewInsights.vue'
import AppModal from '../ui/AppModal.vue'
import { projects, statuses } from '../../data/issues'
import { useWorkspace } from '../../composables/useWorkspace'
const props = defineProps<{ preview?: boolean }>()
const { filtered, selectedId, query, project, status, section, createIssue, activeTeam, content } =
  useWorkspace()
const sidebar = ref(false)
const creating = ref(false)
const creatingBusy = ref(false)
const title = ref('')
const board = ref(false)
const shown = computed(() => (props.preview ? filtered.value.slice(0, 8) : filtered.value))
async function create() {
  if (!title.value.trim() || creatingBusy.value) return
  creatingBusy.value = true
  try {
    if (!(await createIssue(title.value.trim()))) return
    title.value = ''
    creating.value = false
  } finally {
    creatingBusy.value = false
  }
}
</script>
<template>
  <div class="dashboard" :class="{ 'dashboard-full': !preview }">
    <button
      v-if="sidebar"
      class="sidebar-scrim"
      :aria-label="t('Close sidebar')"
      @click="sidebar = false"
    ></button>
    <div class="sidebar-container" :class="{ opened: sidebar }">
      <WorkspaceSidebar :preview="preview" @navigate="sidebar = false" @create="creating = true" />
    </div>
    <main class="dashboard-main">
      <header class="dashboard-topbar">
        <div>
          <button
            class="icon-button dashboard-menu"
            :aria-label="t('Open workspace menu')"
            @click="sidebar = !sidebar"
          >
            <Menu :size="18" /></button
          ><span class="team-icon small">{{ t('A') }}</span
          ><span>{{ content(activeTeam?.name || 'Arcflow Product') }}</span
          ><span class="breadcrumb-slash">/</span><strong>{{ t(section) }}</strong>
        </div>
        <div class="topbar-right">
          <span class="live-dot"></span><span>{{ t('Workspace') }}</span
          ><button class="icon-button" :aria-label="t('Create new issue')" @click="creating = true">
            <Plus :size="16" />
          </button>
        </div>
      </header>
      <div class="dashboard-title">
        <div>
          <span class="eyebrow" v-if="!preview">{{ t('YOUR TEAM, IN SYNC') }}</span>
          <h1>
            {{
              project === 'all'
                ? t(section)
                : content(projects.find((p) => p.id === project)?.name)
            }}<span>{{ t(shown.length) }}</span>
          </h1>
          <p v-if="!preview">{{ t('A little focus. A lot of forward motion.') }}</p>
        </div>
        <button class="button button-small button-secondary" @click="creating = true">
          <Plus :size="14" /> {{ t('New issue') }}
        </button>
      </div>
      <div class="dashboard-toolbar">
        <div class="toolbar-left">
          <div class="view-switch">
            <button :aria-label="t('List view')" :class="{ active: !board }" @click="board = false">
              <LayoutList :size="14" /></button
            ><button :aria-label="t('Board view')" :class="{ active: board }" @click="board = true">
              <Columns3 :size="14" />
            </button>
          </div>
          <label class="filter-control"
            ><SlidersHorizontal :size="13" /><select
              v-model="status"
              :aria-label="t('Filter status')"
            >
              <option value="all">{{ t('All statuses') }}</option>
              <option v-for="s in statuses" :key="s" :value="s">{{ t(s) }}</option>
            </select></label
          ><label class="filter-control project-filter"
            ><select v-model="project" :aria-label="t('Filter project')">
              <option value="all">{{ t('All projects') }}</option>
              <option v-for="p in projects" :value="p.id" :key="p.id">{{ content(p.name) }}</option>
            </select></label
          >
        </div>
        <label class="task-search"
          ><Search :size="13" /><input
            v-model="query"
            :aria-label="t('Search issues')"
            :placeholder="t('Search issues…')"
        /></label>
      </div>
      <WorkspaceOverview
        v-if="!preview && ['Projects', 'Roadmap', 'Cycles', 'Inbox'].includes(section)"
      /><IssueList
        v-else-if="!board"
        :issues="shown"
        :preview="preview"
        @open="selectedId = $event"
      />
      <div v-else class="kanban">
        <div v-for="s in statuses" :key="s" class="kanban-column">
          <h3>
            {{ t(s) }} <span>{{ t(shown.filter((i) => i.status === s).length) }}</span>
          </h3>
          <button
            v-for="issue in shown.filter((i) => i.status === s)"
            :key="issue.id"
            class="kanban-card"
            @click="selectedId = issue.id"
          >
            <small>{{ t(issue.id) }}</small
            ><strong>{{ content(issue.title) }}</strong
            ><span class="tag">{{ t(issue.labels[0]) }}</span>
          </button>
        </div>
      </div>
      <footer class="dashboard-statusbar">
        <span><span class="live-dot"></span>{{ t('All systems in flow') }}</span
        ><span
          >{{
            t(
              preview
                ? 'Interactive demo · not your team’s data'
                : 'Shared with your team · updates every 4 seconds',
            )
          }}
          <ArrowUpRight :size="11"
        /></span>
      </footer>
    </main>
    <PreviewInsights v-if="preview" />
    <AppModal v-if="creating" :title="t('Create issue')" @close="creating = false"
      ><form class="create-form" @submit.prevent="create">
        <label for="issue-title">{{ t('What needs to move forward?') }}</label
        ><input
          id="issue-title"
          v-model="title"
          :placeholder="t('Give your issue a clear title')"
          required
          maxlength="120"
        />
        <p>
          {{ t('Added to') }}
          {{
            t(project === 'all' ? projects[0]?.name : projects.find((p) => p.id === project)?.name)
          }}
          {{ t('· Todo · Medium priority') }}
        </p>
        <button class="button" type="submit" :disabled="creatingBusy">
          {{ t('Create issue') }} <Plus :size="14" />
        </button></form
    ></AppModal>
  </div>
</template>
