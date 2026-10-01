import { ref, watch } from 'vue'
import ru from '../locales/ru.json'
const saved = (() => {
  try {
    return localStorage.getItem('arcflow-language')
  } catch {
    return null
  }
})()
const locale = ref<'en' | 'ru'>(saved === 'ru' ? 'ru' : 'en')
const dictionary: Record<string, string> = ru
const errors: Record<string, string> = {
  invalid_input: 'Check the fields and try again.',
  invalid_email: 'Enter a valid email address.',
  email_in_use: 'This email is already registered. Sign in instead.',
  invalid_credentials: 'Incorrect email or password.',
  sign_in_required: 'Please sign in.',
  too_many_requests: 'Too many attempts. Try again in 15 minutes.',
  team_not_found: 'This team is not available to your account.',
  owner_required: 'Only the team owner can do this.',
  team_limit: 'You can join up to 20 teams.',
  invite_expired: 'This invitation has expired or is no longer valid.',
  issue_conflict: 'Someone else updated this task. The data has refreshed; try your change again.',
  issue_not_found: 'This task has been deleted.',
  invalid_project: 'Choose a project in this team.',
  invalid_assignee: 'The assignee must be a member of this team.',
  server_unavailable: 'Cannot reach the server. Try again.',
  server_error: 'Could not save changes. Try again.',
  copy_manually: 'Select the link and copy it manually.',
}
function t(value: unknown): string {
  if (value === undefined || value === null) return ''
  const source = String(value)
  return locale.value === 'ru'
    ? (dictionary[source.replace(/\s+/g, ' ').trim()] ?? source)
    : (errors[source] ?? source)
}
watch(
  locale,
  (value) => {
    document.documentElement.lang = value
    document.title =
      value === 'ru'
        ? 'Arcflow — задачи и проекты вашей команды'
        : 'Arcflow — Your team’s tasks and projects'
    try {
      localStorage.setItem('arcflow-language', value)
    } catch {
      /* Language still works without storage. */
    }
  },
  { immediate: true },
)
export function useLocale() {
  return { locale, t, toggleLocale: () => (locale.value = locale.value === 'en' ? 'ru' : 'en') }
}
