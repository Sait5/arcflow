<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../composables/useAuth'
import { useLocale } from '../composables/useLocale'
import BrandLogo from '../components/ui/BrandLogo.vue'
import LanguageToggle from '../components/ui/LanguageToggle.vue'
const { t } = useLocale()
const { account, loadSession, joinTeam } = useAuth()
const route = useRoute()
const router = useRouter()
const name = ref('')
const error = ref('')
const busy = ref(false)
onMounted(async () => {
  try {
    const result = await api<{ name: string }>(`/invites/${route.params.token}`)
    name.value = result.name
    await loadSession()
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'server_unavailable'
  }
})
async function join() {
  busy.value = true
  try {
    const team = await joinTeam(String(route.params.token))
    await router.push({ path: '/workspace', query: { team: team.id } })
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'server_unavailable'
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="account-page">
    <header class="account-header">
      <RouterLink to="/"><BrandLogo /></RouterLink><LanguageToggle />
    </header>
    <main class="account-card">
      <span class="eyebrow">{{ t('TEAM INVITATION') }}</span>
      <h1>{{ t(name) }}</h1>
      <p>{{ t('Join this private team to work on shared tasks and projects.') }}</p>
      <p v-if="error" class="form-error" role="alert">{{ t(error) }}</p>
      <template v-else-if="name"
        ><button v-if="account" class="button" :disabled="busy" @click="join">
          {{ t(busy ? 'Please wait…' : 'Join team') }}</button
        ><RouterLink
          v-else
          class="button"
          :to="{ path: '/register', query: { next: route.path } }"
          >{{ t('Create account to join') }}</RouterLink
        ><RouterLink
          v-if="!account"
          :to="{ path: '/login', query: { next: route.path } }"
          class="text-button"
          >{{ t('Already have an account? Log in') }}</RouterLink
        ></template
      >
    </main>
  </div>
</template>
