<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import {
  Inbox,
  CircleDot,
  Layers,
  Map,
  RefreshCw,
  ChevronDown,
  Search,
  Plus,
  Settings2,
  ArrowUpRight,
} from 'lucide-vue-next'
import BrandLogo from '../ui/BrandLogo.vue'
import { projects } from '../../data/issues'
import { useWorkspace } from '../../composables/useWorkspace'
import { useAuth } from '../../composables/useAuth'
defineProps<{ preview?: boolean }>()
const emit = defineEmits<{ navigate: []; create: [] }>()
const { section, project, status, paletteOpen, activeTeam, issues, content } = useWorkspace()
const { account } = useAuth()
const navigation = [
  { text: 'Inbox', icon: Inbox },
  { text: 'My issues', icon: CircleDot },
  { text: 'Projects', icon: Layers },
  { text: 'Roadmap', icon: Map },
  { text: 'Cycles', icon: RefreshCw },
]
function navigate(text: string) {
  section.value = text
  project.value = 'all'
  status.value = 'all'
  emit('navigate')
}
function selectProject(id: string) {
  project.value = id
  section.value = 'All issues'
  status.value = 'all'
  emit('navigate')
}
</script>
<template>
  <aside class="workspace-sidebar">
    <div class="workspace-brand"><BrandLogo /><ChevronDown :size="13" /></div>
    <button class="sidebar-search" @click="paletteOpen = true">
      <Search :size="14" /><span>{{ t('Search anything') }}</span
      ><kbd>{{ t('⌘ K') }}</kbd>
    </button>
    <div class="sidebar-nav">
      <button
        v-for="item in navigation"
        :key="item.text"
        :class="{ active: section === item.text }"
        @click="navigate(item.text)"
      >
        <component :is="item.icon" :size="15" />{{ t(item.text)
        }}<span v-if="item.text === 'Inbox'" class="nav-count">{{
          t(Math.min(3, issues.length))
        }}</span>
      </button>
    </div>
    <div class="sidebar-label">
      {{ t('Workspace') }}
      <button class="icon-button" :aria-label="t('Create issue')" @click="emit('create')">
        <Plus :size="12" />
      </button>
    </div>
    <button
      class="workspace-name"
      :class="{ active: section === 'All issues' && project === 'all' }"
      @click="navigate('All issues')"
    >
      <span class="team-icon">{{ t('A') }}</span
      >{{ content(activeTeam?.name || 'Arcflow Product') }}<ChevronDown :size="12" />
    </button>
    <div class="sidebar-label project-label">{{ t('Projects') }}</div>
    <div class="sidebar-nav">
      <button
        v-for="p in projects"
        :key="p.id"
        :class="{ active: project === p.id }"
        @click="selectProject(p.id)"
      >
        <span class="project-symbol" :class="p.color">◇</span>{{ content(p.name) }}
      </button>
    </div>
    <div class="sidebar-bottom">
      <span class="avatar lavender">{{ t(activeTeam ? account?.initials : 'AM') }}</span>
      <div>
        <strong>{{ content(activeTeam ? account?.name : 'Alex Morgan') }}</strong
        ><small>{{ t(activeTeam ? 'Team workspace' : 'Demo workspace') }}</small>
      </div>
      <Settings2 :size="14" />
    </div>
    <RouterLink v-if="!preview" class="back-home" to="/"
      >{{ t('Back to Arcflow') }} <ArrowUpRight :size="13"
    /></RouterLink>
  </aside>
</template>
