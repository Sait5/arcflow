import { ref } from 'vue'
import { api } from '../lib/api'
import type { User } from '../data/issues'
export interface Team {
  id: string
  name: string
  role: 'owner' | 'member'
}
export interface Account extends User {
  email: string
}
interface Session {
  user: Account | null
  teams: Team[]
}
const account = ref<Account | null>(null)
const teams = ref<Team[]>([])
const ready = ref(false)
let loading: Promise<void> | undefined
async function loadSession() {
  if (!loading)
    loading = api<Session>('/auth/session')
      .then((data) => {
        account.value = data.user
        teams.value = data.teams
        ready.value = true
      })
      .finally(() => {
        loading = undefined
      })
  return loading
}
async function authenticate(
  mode: 'login' | 'register',
  data: { email: string; password: string; name?: string },
) {
  const result = await api<Session>(`/auth/${mode}`, { method: 'POST', body: data })
  account.value = result.user
  teams.value = result.teams
  ready.value = true
}
async function logout() {
  await api('/auth/logout', { method: 'POST', body: {} })
  account.value = null
  teams.value = []
}
async function createTeam(name: string) {
  const { team } = await api<{ team: Team }>('/teams', { method: 'POST', body: { name } })
  teams.value.push(team)
  return team
}
async function joinTeam(token: string) {
  const { team } = await api<{ team: Team }>(`/invites/${token}/join`, { method: 'POST', body: {} })
  if (!teams.value.some((t) => t.id === team.id)) teams.value.push(team)
  return team
}
export function useAuth() {
  return { account, teams, ready, loadSession, authenticate, logout, createTeam, joinTeam }
}
