<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ArrowRight, LayoutDashboard } from 'lucide-vue-next'
import BrandLogo from '../ui/BrandLogo.vue'
import { useReveal } from '../../composables/useMotion'
const reveal = useReveal()
</script>
<template>
  <section id="pricing" class="closing container" v-motion="reveal">
    <BrandLogo compact />
    <h2>{{ t('Make room for what’s next.') }}<br />{{ t('Start with Arcflow.') }}</h2>
    <div class="closing-actions">
      <RouterLink to="/workspace" class="button"
        >{{ t('Start building') }} <ArrowRight :size="13" /></RouterLink
      ><RouterLink to="/workspace" class="button button-secondary"
        ><LayoutDashboard :size="13" />{{ t('Explore workspace') }}</RouterLink
      >
    </div>
    <small>{{ t('Create an account and invite your team.') }}</small>
  </section>
</template>
