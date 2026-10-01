<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { ArrowRight, Plus, Search, Layers, CornerDownLeft, Command } from 'lucide-vue-next'
import { useWorkspace } from '../../composables/useWorkspace'
import { useReveal } from '../../composables/useMotion'
const { paletteOpen } = useWorkspace()
const reveal = useReveal()
</script>
<template>
  <section class="command-section container section" v-motion="reveal">
    <div class="command-copy">
      <span class="eyebrow"
        ><span class="label-dot"></span> {{ t('LESS FRICTION. MORE FLOW.') }}</span
      >
      <h2>{{ t('Move at the') }}<br />{{ t('speed of thought.') }}</h2>
      <p>
        {{ t('Your next action is always one shortcut away.') }}<br />{{
          t('Stay in the flow, and let the interface keep up.')
        }}
      </p>
      <button class="shortcut-button" @click="paletteOpen = true">
        <Command :size="16" /><span>{{ t('K') }}</span
        ><span class="shortcut-description">{{ t('Try the command menu') }}</span
        ><ArrowRight :size="15" />
      </button>
    </div>
    <button
      class="command-demo"
      :aria-label="t('Open command palette')"
      @click="paletteOpen = true"
    >
      <div class="demo-search">
        <Search :size="17" /><span>{{ t('What would you like to do?') }}</span
        ><kbd>{{ t('⌘ K') }}</kbd>
      </div>
      <div class="demo-label">{{ t('SUGGESTED ACTIONS') }}</div>
      <div class="demo-command selected">
        <Plus :size="16" /><span>{{ t('Create issue') }}</span
        ><CornerDownLeft :size="13" />
      </div>
      <div class="demo-command">
        <Search :size="16" /><span>{{ t('Search workspace') }}</span
        ><kbd>{{ t('S') }}</kbd>
      </div>
      <div class="demo-command">
        <Layers :size="16" /><span>{{ t('Change project') }}</span
        ><kbd>{{ t('P') }}</kbd>
      </div>
      <div class="demo-bottom">
        {{ t('Your entire workspace. At your fingertips.') }}<span>↵</span>
      </div>
    </button>
  </section>
</template>
