<script setup lang="ts">
import { useWorkspace } from '../composables/useWorkspace'
useWorkspace().enterDemo()
import '../assets/landing.css'
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import HeroSection from '../components/landing/HeroSection.vue'
import CustomersSection from '../components/landing/CustomersSection.vue'
import ProductPrinciples from '../components/landing/ProductPrinciples.vue'
import ProductStory from '../components/landing/ProductStory.vue'
import IntegrationsSection from '../components/landing/IntegrationsSection.vue'
import ClosingSection from '../components/landing/ClosingSection.vue'
</script>
<template>
  <div class="landing reference-landing">
    <AppHeader />
    <main>
      <HeroSection /><CustomersSection />
      <div class="celestial-divider" aria-hidden="true"><span></span></div>
      <ProductPrinciples /><ProductStory kind="issues" /><ProductStory kind="cycles" /><ProductStory
        kind="roadmap"
      /><IntegrationsSection /><ClosingSection />
    </main>
    <AppFooter />
  </div>
</template>
