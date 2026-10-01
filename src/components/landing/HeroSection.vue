<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ArrowRight, ArrowUpRight } from 'lucide-vue-next'
import ProductPreview from './ProductPreview.vue'
</script>
<template>
  <section class="hero container">
    <div class="hero-copy">
      <a href="#changelog" class="announcement"
        ><span class="announcement-dot"></span>{{ t('Meet your next chapter') }}
        <span class="announcement-divider"></span> {{ t('Arcflow 2.4') }} <ArrowRight :size="13"
      /></a>
      <h1>
        <span class="hero-line">{{ t('Plan. Build. Ship.') }}</span
        ><span class="hero-line hero-muted">{{ t('Without the noise.') }}</span>
      </h1>
      <p class="hero-description">
        {{ t('Arcflow brings product planning, issues and team workflows')
        }}<br class="desktop-break" />
        {{ t('into one focused workspace.') }}
      </p>
      <div class="hero-actions">
        <RouterLink to="/workspace" class="button"
          >{{ t('Start building') }} <ArrowUpRight :size="15" /></RouterLink
        ><RouterLink to="/workspace" class="text-button"
          >{{ t('Explore workspace') }} <ArrowRight :size="15"
        /></RouterLink>
      </div>
      <div class="hero-note">
        <span class="tiny-stars">✦</span> {{ t('A clearer path from idea to shipped.') }}
      </div>
    </div>
    <ProductPreview />
    <div class="preview-caption">
      <span>{{ t('BUILT FOR FOCUS. DESIGNED FOR FLOW.') }}</span
      ><span>{{ t('01 / WORKSPACE') }}</span>
    </div>
  </section>
</template>
