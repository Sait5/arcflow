<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useWorkspace } from '../composables/useWorkspace'
import { useLocale } from '../composables/useLocale'
import { api, ApiError } from '../lib/api'
import WorkspaceDashboard from '../components/workspace/WorkspaceDashboard.vue'
import BrandLogo from '../components/ui/BrandLogo.vue'
import LanguageToggle from '../components/ui/LanguageToggle.vue'
import AppModal from '../components/ui/AppModal.vue'
import { users } from '../data/issues'
const { t } = useLocale()
const { account, teams, loadSession, logout, createTeam } = useAuth()
const { activeTeam, enterTeam, enterDemo, stopSync, connectionError, createProject, notify } =
  useWorkspace()
const route = useRoute()
const router = useRouter()
const ready = ref(false)
const error = ref('')
const busy = ref(false)
const teamName = ref('')
const projectName = ref('')
const dialog = ref('')
const inviteUrl = ref('')
function openDialog(value: string) {
  dialog.value = value
  error.value = ''
}
function closeDialog() {
  dialog.value = ''
  error.value = ''
}
onMounted(async () => {
  try {
    await loadSession()
    ready.value = true
    if (account.value) await selectCurrent(true)
  } catch {
    error.value = 'server_unavailable'
    ready.value = true
  }
})
async function selectCurrent(force = false) {
  const team = teams.value.find((t) => t.id === route.query.team) || teams.value[0]
  if (team && (force || team.id !== activeTeam.value?.id)) await enterTeam(team)
}
watch(
  () => route.query.team,
  () => {
    if (ready.value && account.value) void selectCurrent()
  },
)
watch(account, (value) => {
  if (!value) {
    enterDemo()
    void router.replace('/login')
  }
})
onBeforeUnmount(stopSync)
async function makeTeam() {
  busy.value = true
  error.value = ''
  try {
    const team = await createTeam(teamName.value)
    dialog.value = ''
    teamName.value = ''
    await enterTeam(team)
    await router.replace({ path: '/workspace', query: { team: team.id } })
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'server_unavailable'
  } finally {
    busy.value = false
  }
}
async function invite() {
  dialog.value = 'invite'
  inviteUrl.value = ''
  error.value = ''
  busy.value = true
  try {
    const result = await api<{ url: string }>(`/teams/${activeTeam.value?.id}/invites`, {
      method: 'POST',
      body: {},
    })
    inviteUrl.value = result.url
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'server_unavailable'
  } finally {
    busy.value = false
  }
}
async function copyInvite() {
  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    notify('Invitation copied')
  } catch {
    error.value = 'copy_manually'
  }
}
async function addProject() {
  busy.value = true
  error.value = ''
  try {
    await createProject(projectName.value)
    projectName.value = ''
    dialog.value = ''
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'server_unavailable'
  } finally {
    busy.value = false
  }
}
async function signOut() {
  try {
    await logout()
    enterDemo()
    await router.replace('/login')
  } catch {
    notify('server_unavailable')
  }
}
</script>
<template>
  <div class="workspace-page live-workspace">
    <header class="team-toolbar">
      <RouterLink to="/"><BrandLogo /></RouterLink
      ><template v-if="account && teams.length"
        ><label class="team-selector"
          >{{ t('Team')
          }}<select
            :value="activeTeam?.id"
            :aria-label="t('Select team')"
            @change="
              router.replace({
                path: '/workspace',
                query: { team: ($event.target as HTMLSelectElement).value },
              })
            "
          >
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ t(team.name) }}
            </option>
          </select></label
        ><button class="team-action" @click="openDialog('team')">
          {{ t('New team') }}</button
        ><button class="team-action" @click="dialog = 'members'">{{ t('Members') }}</button
        ><button v-if="activeTeam?.role === 'owner'" class="team-action" @click="invite">
          {{ t('Invite people') }}</button
        ><button class="team-action" @click="openDialog('project')">
          {{ t('New project') }}
        </button></template
      >
      <div class="team-toolbar-end">
        <LanguageToggle /><button v-if="account" class="team-action" @click="signOut">
          {{ t('Log out') }}
        </button>
      </div>
    </header>
    <main v-if="!ready" class="account-card">
      <p>{{ t('Please wait…') }}</p>
    </main>
    <main v-else-if="!account" class="account-card">
      <h1>{{ t('Your team, in one place.') }}</h1>
      <p>{{ t('Create an account or sign in to work with your team.') }}</p>
      <p v-if="error" class="form-error" role="alert">{{ t(error) }}</p>
      <RouterLink class="button" to="/register">{{ t('Create account') }}</RouterLink
      ><RouterLink class="text-button" to="/login">{{ t('Log in') }}</RouterLink>
    </main>
    <main v-else-if="!teams.length" class="account-card">
      <span class="eyebrow">{{ t('A FRESH START') }}</span>
      <h1>{{ t('Create your first team') }}</h1>
      <p>
        {{
          t(
            'Invite colleagues, create projects, and keep everyone’s tasks in one private workspace.',
          )
        }}
      </p>
      <form @submit.prevent="makeTeam">
        <label>{{ t('Team name') }}<input v-model="teamName" maxlength="80" required /></label>
        <p v-if="error" class="form-error" role="alert">{{ t(error) }}</p>
        <button class="button" :disabled="busy">{{ t('Create team') }}</button>
      </form>
    </main>
    <template v-else
      ><p v-if="connectionError" class="connection-warning" role="alert">
        {{ t(connectionError) }}
      </p>
      <WorkspaceDashboard v-if="activeTeam"
    /></template>
    <AppModal
      v-if="dialog"
      :title="
        t(
          dialog === 'team'
            ? 'Create team'
            : dialog === 'members'
              ? 'Team members'
              : dialog === 'project'
                ? 'Create project'
                : 'Invite your team',
        )
      "
      @close="closeDialog"
    >
      <div class="team-dialog">
        <form v-if="dialog === 'team'" @submit.prevent="makeTeam">
          <label>{{ t('Team name') }}<input v-model="teamName" maxlength="80" required /></label
          ><button class="button" :disabled="busy">{{ t('Create team') }}</button>
        </form>
        <form v-else-if="dialog === 'project'" @submit.prevent="addProject">
          <label
            >{{ t('Project name') }}<input v-model="projectName" maxlength="80" required /></label
          ><button class="button" :disabled="busy">{{ t('Create project') }}</button>
        </form>
        <template v-else-if="dialog === 'members'"
          ><p>{{ t('Only these people can see this team’s work.') }}</p>
          <div v-for="member in users" :key="member.id" class="member-row">
            <span class="avatar lavender">{{ t(member.initials) }}</span
            ><strong>{{ t(member.name) }}</strong
            ><span>{{ t(member.id === account?.id ? 'You' : 'Member') }}</span>
          </div></template
        >
        <template v-else
          ><p>
            {{
              t(
                'Share this link with the people you want to invite. It expires in 24 hours and allows up to 20 joins. Creating a new link replaces the previous one.',
              )
            }}
          </p>
          <label v-if="inviteUrl"
            >{{ t('Invitation link')
            }}<input
              :value="inviteUrl"
              readonly
              @focus="($event.target as HTMLInputElement).select()" /></label
          ><button v-if="inviteUrl" class="button" @click="copyInvite">
            {{ t('Copy invitation') }}
          </button>
          <p v-if="busy">{{ t('Please wait…') }}</p></template
        >
        <p v-if="error" class="form-error" role="alert">{{ t(error) }}</p>
      </div>
    </AppModal>
  </div>
</template>
