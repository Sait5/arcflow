<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { useReveal } from '../../composables/useMotion'
const reveal = useReveal()
</script>
<template>
  <section class="metrics container" v-motion="reveal">
    <div>
      <strong>32<span>%</span></strong>
      <h3>{{ t('Faster cycles') }}</h3>
      <p>{{ t('More momentum. Fewer roadblocks.') }}</p>
    </div>
    <div>
      <strong>2.4<span>×</span></strong>
      <h3>{{ t('Fewer meetings') }}</h3>
      <p>{{ t('Let your work speak for itself.') }}</p>
    </div>
    <div>
      <strong>98<span>%</span></strong>
      <h3>{{ t('Team visibility') }}</h3>
      <p>{{ t('Everyone on the same page.') }}</p>
    </div>
    <small>{{ t('Illustrative metrics for this product concept.') }}</small>
  </section>
</template>
