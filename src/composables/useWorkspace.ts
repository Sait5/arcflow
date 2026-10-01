import { ref, computed } from 'vue'
import { initialIssues, users, projects } from '../data/issues'
import type { Issue, User, Project } from '../data/issues'
import { api, ApiError } from '../lib/api'
import { useAuth, type Team } from './useAuth'
import { useLocale } from './useLocale'
const { t } = useLocale()
const demoUsers = JSON.parse(JSON.stringify(users)) as User[]
const demoProjects = JSON.parse(JSON.stringify(projects)) as Project[]
const issues = ref<Issue[]>(structuredClone(initialIssues))
const selectedId = ref<string | null>(null)
const query = ref('')
const project = ref('all')
const status = ref('all')
const section = ref('All issues')
const paletteOpen = ref(false)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout>
const activeTeam = ref<Team | null>(null)
const syncing = ref(false)
const connectionError = ref('')
let epoch = 0
let pending = 0
let timer: ReturnType<typeof setInterval> | undefined
const { account } = useAuth()
const selected = computed(() => issues.value.find((i) => i.id === selectedId.value))
const filtered = computed(() =>
  issues.value.filter(
    (i) =>
      (project.value === 'all' || i.project === project.value) &&
      (status.value === 'all' || i.status === status.value) &&
      (section.value !== 'My issues' ||
        i.assignee === (activeTeam.value ? account.value?.id : 'alex')) &&
      `${i.title} ${i.id} ${i.labels.join(' ')}`.toLowerCase().includes(query.value.toLowerCase()),
  ),
)
function notify(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 3200)
}
function content(value: unknown) {
  return activeTeam.value ? String(value ?? '') : t(value)
}
function resetFilters() {
  selectedId.value = null
  paletteOpen.value = false
  project.value = 'all'
  status.value = 'all'
  query.value = ''
  section.value = 'All issues'
}
function stopSync() {
  if (timer) clearInterval(timer)
  timer = undefined
  epoch++
  resetFilters()
}
function enterDemo() {
  stopSync()
  activeTeam.value = null
  connectionError.value = ''
  syncing.value = false
  issues.value = structuredClone(initialIssues)
  users.splice(0, users.length, ...structuredClone(demoUsers))
  projects.splice(0, projects.length, ...structuredClone(demoProjects))
}
interface Workspace {
  team: Team
  users: User[]
  projects: Project[]
  issues: Issue[]
}
async function refresh() {
  const teamId = activeTeam.value?.id
  const generation = epoch
  if (!teamId || pending || syncing.value) return
  syncing.value = true
  try {
    const result = await api<Workspace>(`/teams/${teamId}/workspace`)
    if (generation !== epoch || pending) return
    issues.value = result.issues
    users.splice(0, users.length, ...result.users)
    projects.splice(0, projects.length, ...result.projects)
    activeTeam.value = result.team
    connectionError.value = ''
    if (selectedId.value && !issues.value.some((i) => i.id === selectedId.value))
      selectedId.value = null
  } catch (e) {
    if (generation === epoch) {
      connectionError.value = e instanceof ApiError ? e.code : 'server_unavailable'
      if (e instanceof ApiError && e.status === 401) {
        stopSync()
        account.value = null
      }
    }
  } finally {
    if (generation === epoch) syncing.value = false
  }
}
async function enterTeam(team: Team) {
  stopSync()
  activeTeam.value = team
  issues.value = []
  users.splice(0)
  projects.splice(0)
  syncing.value = false
  await refresh()
  timer = setInterval(() => {
    if (!document.hidden) void refresh()
  }, 4000)
}
async function createIssue(title: string, description = '') {
  if (!title.trim()) return
  const teamId = activeTeam.value?.id
  const generation = epoch
  if (!teamId) {
    const id = `ARC-${Math.max(0, ...issues.value.map((i) => Number(i.id.split('-')[1]) || 0)) + 1}`
    const value: Issue = {
      id,
      title: title.trim(),
      description,
      status: 'Todo',
      priority: 'Medium',
      assignee: 'alex',
      project: project.value === 'all' ? 'website' : project.value,
      labels: ['Feature'],
    }
    issues.value.unshift(value)
    selectedId.value = id
    notify('Demo issue created')
    return value
  }
  pending++
  try {
    const { issue } = await api<{ issue: Issue }>(`/teams/${teamId}/issues`, {
      method: 'POST',
      body: {
        title: title.trim(),
        description,
        project: project.value === 'all' ? projects[0]?.id : project.value,
        assignee: account.value?.id,
      },
    })
    if (generation !== epoch) return
    issues.value.unshift(issue)
    selectedId.value = issue.id
    notify('Issue created')
    return issue
  } catch (e) {
    notify(e instanceof ApiError ? e.code : 'server_unavailable')
    return undefined
  } finally {
    pending--
  }
}
async function updateIssue(id: string, changes: Partial<Issue>) {
  const current = issues.value.find((i) => i.id === id)
  if (!current) return false
  if (!activeTeam.value) {
    Object.assign(current, changes)
    notify('Demo issue updated')
    return true
  }
  const teamId = activeTeam.value.id
  const generation = epoch
  pending++
  try {
    const { issue } = await api<{ issue: Issue }>(
      `/teams/${teamId}/issues/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: { ...changes, version: changes.version ?? current.version } },
    )
    if (generation !== epoch) return false
    const index = issues.value.findIndex((i) => i.id === id)
    if (index >= 0) issues.value[index] = issue
    notify('Issue saved')
    return true
  } catch (e) {
    notify(e instanceof ApiError ? e.code : 'server_unavailable')
    return false
  } finally {
    pending--
    await refresh()
  }
}
async function deleteIssue(id: string) {
  const generation = epoch
  if (activeTeam.value)
    await api(`/teams/${activeTeam.value.id}/issues/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: {},
    })
  if (generation !== epoch) return
  issues.value = issues.value.filter((i) => i.id !== id)
  selectedId.value = null
  notify('Issue deleted')
}
async function createProject(name: string) {
  if (!activeTeam.value) return
  const generation = epoch
  const { project: value } = await api<{ project: Project }>(
    `/teams/${activeTeam.value.id}/projects`,
    { method: 'POST', body: { name } },
  )
  if (generation !== epoch) return
  projects.push(value)
  project.value = value.id
  section.value = 'All issues'
  notify('Project created')
}
export function useWorkspace() {
  return {
    issues,
    selectedId,
    selected,
    query,
    project,
    status,
    section,
    filtered,
    paletteOpen,
    toast,
    notify,
    createIssue,
    updateIssue,
    deleteIssue,
    createProject,
    activeTeam,
    syncing,
    connectionError,
    enterTeam,
    enterDemo,
    stopSync,
    refresh,
    content,
  }
}
