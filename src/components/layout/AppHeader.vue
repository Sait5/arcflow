<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ref } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'
import BrandLogo from '../ui/BrandLogo.vue'
import LanguageToggle from '../ui/LanguageToggle.vue'
const open = ref(false)
const { y } = useWindowScroll()
const links = [
  { text: 'Features', hash: 'features' },
  { text: 'Method', hash: 'method' },
  { text: 'Customers', hash: 'customers' },
  { text: 'Changelog', hash: 'changelog' },
  { text: 'Pricing', hash: 'pricing' },
]
</script>
<template>
  <header class="site-header" :class="{ scrolled: y > 24 }">
    <nav class="container header-inner" :aria-label="t('Main navigation')">
      <RouterLink to="/" :aria-label="t('Arcflow home')"><BrandLogo /></RouterLink>
      <div class="desktop-links">
        <a v-for="link in links" :key="link.hash" :href="`#${link.hash}`">{{ t(link.text) }}</a>
      </div>
      <div class="header-actions">
        <LanguageToggle />
        <RouterLink class="login-link" to="/login">{{ t('Log in') }}</RouterLink
        ><RouterLink class="button button-small" to="/register"
          >{{ t('Get started') }} <ArrowUpRight :size="13" /></RouterLink
        ><button
          class="icon-button mobile-toggle"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          :aria-label="t(open ? 'Close menu' : 'Open menu')"
          @click="open = !open"
        >
          <X v-if="open" :size="20" /><Menu v-else :size="20" />
        </button>
      </div>
    </nav>
    <div v-if="open" id="mobile-nav" class="mobile-menu">
      <a v-for="link in links" :key="link.hash" :href="`#${link.hash}`" @click="open = false">{{
        t(link.text)
      }}</a
      ><RouterLink to="/workspace" @click="open = false">{{ t('Log in to workspace') }}</RouterLink>
    </div>
  </header>
</template>
