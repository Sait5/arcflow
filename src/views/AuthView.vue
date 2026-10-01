<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '../components/ui/BrandLogo.vue'
import LanguageToggle from '../components/ui/LanguageToggle.vue'
import { useAuth } from '../composables/useAuth'
import { useLocale } from '../composables/useLocale'
import { ApiError } from '../lib/api'
const { t } = useLocale()
const route = useRoute()
const router = useRouter()
const { authenticate, account, loadSession } = useAuth()
const registering = computed(() => route.path === '/register')
const name = ref('')
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const destination = computed(() =>
  typeof route.query.next === 'string' &&
  /^(\/workspace(?:\?[^\r\n]*)?|\/invite\/[a-f0-9]{64})$/.test(route.query.next)
    ? route.query.next
    : '/workspace',
)
async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await authenticate(registering.value ? 'register' : 'login', {
      name: name.value,
      email: email.value,
      password: password.value,
    })
    password.value = ''
    await router.push(destination.value)
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'server_unavailable'
  } finally {
    busy.value = false
  }
}
onMounted(() => {
  void loadSession()
    .then(() => {
      if (account.value) void router.replace(destination.value)
    })
    .catch(() => {
      /* Signing in displays any network failure. */
    })
})
</script>
<template>
  <div class="account-page">
    <header class="account-header">
      <RouterLink to="/"><BrandLogo /></RouterLink><LanguageToggle />
    </header>
    <main class="account-card">
      <span class="eyebrow">{{ t('YOUR TEAM’S SHARED WORKSPACE') }}</span>
      <h1>{{ t(registering ? 'Create your account' : 'Welcome back') }}</h1>
      <p>{{ t('Private teams. Shared tasks. A clear next step.') }}</p>
      <form @submit.prevent="submit">
        <label v-if="registering"
          >{{ t('Your name')
          }}<input v-model="name" autocomplete="name" maxlength="80" required /></label
        ><label
          >{{ t('Email')
          }}<input
            v-model="email"
            type="email"
            autocomplete="email"
            maxlength="254"
            required /></label
        ><label
          >{{ t('Password')
          }}<input
            v-model="password"
            type="password"
            :autocomplete="registering ? 'new-password' : 'current-password'"
            :minlength="registering ? 12 : 1"
            maxlength="256"
            required /></label
        ><small v-if="registering">{{ t('Use at least 12 characters.') }}</small>
        <p v-if="error" role="alert" class="form-error">{{ t(error) }}</p>
        <button class="button" :disabled="busy" type="submit">
          {{ t(busy ? 'Please wait…' : registering ? 'Create account' : 'Log in') }}
        </button>
      </form>
      <p class="account-switch">
        {{ t(registering ? 'Already have an account?' : 'New to Arcflow?') }}
        <RouterLink
          :to="{ path: registering ? '/login' : '/register', query: { next: destination } }"
          >{{ t(registering ? 'Log in' : 'Create account') }}</RouterLink
        >
      </p>
    </main>
  </div>
</template>
