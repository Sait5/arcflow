<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ref } from 'vue'
import {
  Github,
  GitBranch,
  Figma,
  MessageSquare,
  Database,
  Bug,
  Plus,
  ArrowRight,
} from 'lucide-vue-next'
import { useReveal } from '../../composables/useMotion'
import AppModal from '../ui/AppModal.vue'
const reveal = useReveal()
const open = ref(false)
const connections = [
  {
    name: 'GitHub & GitLab',
    icon: Github,
    text: 'Connect the code to the work. Follow pull requests alongside your issues.',
  },
  {
    name: 'Slack & Discord',
    icon: MessageSquare,
    text: 'Bring the right updates into the conversations you’re already having.',
  },
  {
    name: 'Sentry',
    icon: Bug,
    text: 'Turn an unexpected error into a clear, actionable next step.',
  },
  {
    name: 'Data & analytics',
    icon: Database,
    text: 'Keep your workspace in step with the insights that matter.',
  },
  {
    name: 'Customer conversations',
    icon: GitBranch,
    text: 'Carry customer feedback from the first conversation to the final release.',
  },
  {
    name: 'Figma',
    icon: Figma,
    text: 'Bring design and development closer, with context in both directions.',
  },
]
</script>
<template>
  <section id="integrations" class="integrations-story product-story">
    <div class="container">
      <div class="center-heading" v-motion="reveal">
        <h2>
          {{ t('A connected workspace.') }}<br /><span>{{ t('A clearer way forward.') }}</span>
        </h2>
      </div>
      <div class="integration-orbit" v-motion="reveal">
        <div class="orbit-sphere"></div>
        <div class="orbit-row">
          <button
            v-for="item in connections.slice(0, 3)"
            :key="item.name"
            :aria-label="t(`View ${item.name} integration concept`)"
            @click="open = true"
          >
            <component :is="item.icon" :size="24" /></button
          ><button
            class="orbit-center"
            :aria-label="t('Explore integrations')"
            @click="open = true"
          >
            <Plus :size="37" /></button
          ><button
            v-for="item in connections.slice(3)"
            :key="item.name"
            :aria-label="t(`View ${item.name} integration concept`)"
            @click="open = true"
          >
            <component :is="item.icon" :size="24" />
          </button>
        </div>
      </div>
      <p class="story-description" v-motion="reveal">
        {{ t('Bring conversations, code, and customer context') }}<br />{{
          t('into the same flow. Less switching. More building.')
        }}
      </p>
      <button class="integration-link" @click="open = true">
        {{ t('Explore connections') }} <ArrowRight :size="12" />
      </button>
      <div class="story-capabilities" v-motion="reveal">
        <p v-for="item in connections" :key="item.name">
          <component :is="item.icon" :size="14" /><span
            ><strong>{{ t(item.name) }}.</strong> {{ t(item.text) }}</span
          >
        </p>
      </div>
    </div>
    <div class="celestial-divider lower-sky" aria-hidden="true"><span></span></div>
    <AppModal v-if="open" :title="t('Connected by design')" @close="open = false"
      ><div class="info-content">
        <h2>{{ t('A vision for connected work.') }}</h2>
        <p>
          {{
            t(
              'These connections illustrate Arcflow’s product direction. This portfolio demo runs locally, so external services are not connected.',
            )
          }}
        </p>
        <button class="button button-secondary" @click="open = false">
          {{ t('Back to the flow') }}
        </button>
      </div></AppModal
    >
  </section>
</template>
