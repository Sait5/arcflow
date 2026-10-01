<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ref } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import BrandLogo from '../ui/BrandLogo.vue'
import AppModal from '../ui/AppModal.vue'
const info = ref('')
const columns = [
  { title: 'Product', links: ['Features', 'Integrations', 'Pricing', 'Changelog'] },
  { title: 'Company', links: ['About', 'Careers', 'Customers'] },
  { title: 'Resources', links: ['Community', 'Contact', 'Privacy', 'Terms'] },
  { title: 'Developers', links: ['API', 'Status', 'GitHub'] },
]
const anchors: Record<string, string> = {
  Features: 'features',
  Pricing: 'pricing',
  Changelog: 'changelog',
  Customers: 'customers',
}
const descriptions: Record<string, string> = {
  Integrations:
    'Teams, projects, and tasks are available now. External integrations are concepts for future development.',
  About:
    'Arcflow is a shared task workspace. Create a private team, invite colleagues, and track projects together.',
  Careers: 'A small project with big ambitions. There are currently no open positions.',
  Community: 'A space for the people who build. Community features are part of the product vision.',
  Contact: 'Contact information has not been configured for this instance of Arcflow.',
  Privacy:
    'Account details and team tasks are stored on this instance’s server. Tasks are visible only to members of their team. Passwords are hashed. Language preference is stored in your browser. No analytics are installed.',
  Terms:
    'Arcflow is an early working version. The landing page contains illustrative previews. Real team data is available after signing in. Service terms have not been configured for public use.',
  API: 'The application uses a session-protected API for teams, invitations, projects, and tasks. A public developer API is not available.',
  Status:
    'There is no public status page yet. Connection problems are shown inside your workspace.',
  GitHub:
    'The complete frontend source is included in this project. See the README for setup and architecture.',
}
</script>
<template>
  <footer class="site-footer container">
    <div class="footer-main">
      <div class="footer-brand">
        <RouterLink to="/"><BrandLogo /></RouterLink>
        <p>{{ t('Designed for teams') }}<br />{{ t('that move fast.') }}</p>
        <span class="footer-symbol">↗</span>
      </div>
      <div v-for="column in columns" :key="column.title" class="footer-column">
        <h3>{{ t(column.title) }}</h3>
        <template v-for="link in column.links" :key="link"
          ><a v-if="anchors[link]" :href="`#${anchors[link]}`">{{ t(link) }}</a
          ><button v-else @click="info = link">{{ t(link) }}</button></template
        >
      </div>
    </div>
    <div class="footer-bottom">
      <span>© {{ t(new Date().getFullYear()) }} {{ t('Arcflow') }}</span
      ><span>{{ t('A little focus goes a long way.') }}</span
      ><RouterLink to="/workspace"
        >{{ t('Open workspace') }} <ArrowUpRight :size="12"
      /></RouterLink>
    </div>
    <AppModal v-if="info" :title="t(info)" @close="info = ''"
      ><div class="info-content">
        <h2>{{ t(info) }}</h2>
        <p>{{ t(descriptions[info]) }}</p>
        <button class="button button-secondary" @click="info = ''">{{ t('Got it') }}</button>
      </div></AppModal
    >
  </footer>
</template>
