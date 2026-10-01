<script setup lang="ts">
import { Languages } from 'lucide-vue-next'
import { useLocale } from '../../composables/useLocale'
const { locale, toggleLocale } = useLocale()
</script>
<template>
  <button
    class="language-toggle"
    type="button"
    :aria-label="locale === 'en' ? 'Перевести на русский' : 'Switch to English'"
    @click="toggleLocale"
  >
    <Languages :size="14" /><span>{{ locale === 'en' ? 'RU' : 'EN' }}</span>
  </button>
</template>
