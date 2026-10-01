<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { Command, ArrowRight, Search, Plus, CircleDot, SignalHigh } from 'lucide-vue-next'
import { useWorkspace } from '../../composables/useWorkspace'
import { useReveal } from '../../composables/useMotion'
import BrandLogo from '../ui/BrandLogo.vue'
const { paletteOpen } = useWorkspace()
const reveal = useReveal()
const keyboard = [
  ['esc', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '+'],
  ['tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '⌫'],
  ['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '↵'],
  ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '↑', 'shift'],
  ['fn', '⌃', '⌥', '⌘', 'space', '⌘', '⌥', '←', '↓', '→'],
]
</script>
<template>
  <section id="method" class="principles container">
    <div class="center-heading" v-motion="reveal">
      <h2>
        {{ t('Focus you can feel.') }}<br /><span>{{ t('Flow you can follow.') }}</span>
      </h2>
      <p>
        {{ t('Thoughtfully designed down to the last detail.') }}<br />{{
          t('A calmer interface. A faster way to work.')
        }}
      </p>
    </div>
    <div class="principles-grid">
      <article class="principle-card keyboard-card" v-motion="useReveal()">
        <button
          class="keyboard-visual"
          :aria-label="t('Try keyboard commands')"
          @click="paletteOpen = true"
        >
          <div v-for="(row, i) in keyboard" :key="i" class="keyboard-row">
            <span
              v-for="(key, j) in row"
              :key="j"
              class="keyboard-key"
              :class="{ space: key === 'space', lit: key === 'K' }"
              >{{ t(key === 'space' ? '' : key) }}</span
            >
          </div>
        </button>
        <div class="keyboard-shortcuts">
          <span
            ><Command :size="11" /> {{ t('K') }} <small>{{ t('Command menu') }}</small></span
          ><span
            >{{ t('A') }} <small>{{ t('Assign issue') }}</small></span
          ><span
            >{{ t('S') }} <small>{{ t('Change status') }}</small></span
          >
        </div>
        <div class="principle-copy">
          <h3>{{ t('Built around your keyboard') }}</h3>
          <p>
            {{ t('Keep your hands on the keys and your mind') }}<br />{{
              t('on the work. Every action, within reach.')
            }}
          </p>
        </div>
      </article>
      <article class="principle-card speed-card" v-motion="useReveal(100)">
        <div class="speed-visual" aria-hidden="true">
          <svg viewBox="0 0 180 220">
            <defs>
              <linearGradient id="bolt-shade" x1="0" y1="0" x2="1" y2="1">
                <stop stop-color="#a8a0ff" />
                <stop offset="1" stop-color="#454096" />
              </linearGradient>
              <clipPath id="bolt-clip">
                <path
                  d="M101 8 27 116q-5 8 5 8h42l-8 83q-1 10 6 1l80-118q5-8-5-8h-43l8-69q2-14-11-5Z"
                />
              </clipPath>
            </defs>
            <path
              d="M101 8 27 116q-5 8 5 8h42l-8 83q-1 10 6 1l80-118q5-8-5-8h-43l8-69q2-14-11-5Z"
              fill="url(#bolt-shade)"
              stroke="#afa5ff"
              stroke-opacity=".55"
            />
            <path
              v-for="y in 30"
              :key="y"
              :d="`M26 ${y * 6}H151`"
              stroke="#b9b0ff"
              stroke-opacity=".22"
              clip-path="url(#bolt-clip)"
            />
          </svg>
        </div>
        <div class="principle-copy">
          <h3>{{ t('Nothing between you and next') }}</h3>
          <p>
            {{ t('Instant interactions. Effortless navigation.') }}<br />{{
              t('Speed that quietly gets out of your way.')
            }}
          </p>
        </div>
      </article>
      <article class="principle-card craft-card" v-motion="useReveal()">
        <div class="craft-visual" aria-hidden="true">
          <div class="craft-ring"><BrandLogo compact /></div>
        </div>
        <div class="principle-copy">
          <h3>{{ t('Made for teams') }}<br />{{ t('that make things') }}</h3>
          <p>
            {{ t('Flexible workflows, a shared direction,') }}<br />{{
              t('and room for your own rhythm.')
            }}
          </p>
        </div>
      </article>
      <article class="principle-card palette-card" v-motion="useReveal(100)">
        <div class="principle-copy">
          <h3>{{ t('Move at the speed of thought.') }}</h3>
          <p>
            {{ t('The whole workspace, one shortcut away.') }}<br />{{
              t('Find it. Change it. Keep going.')
            }}
          </p>
        </div>
        <button
          class="embedded-palette"
          :aria-label="t('Open command palette')"
          @click="paletteOpen = true"
        >
          <div class="embedded-palette-head">
            <span>{{ t('Arcflow command menu') }}</span
            ><kbd>{{ t('⌘ K') }}</kbd>
          </div>
          <div class="embedded-palette-search">
            <Search :size="14" />{{ t('Type a command or search…') }}
          </div>
          <div
            v-for="(item, i) in [
              { text: 'Create issue', icon: Plus },
              { text: 'Change status', icon: CircleDot },
              { text: 'Set priority', icon: SignalHigh },
            ]"
            :key="item.text"
            class="embedded-palette-command"
            :class="{ selected: i === 0 }"
          >
            <component :is="item.icon" :size="13" /><span>{{ t(item.text) }}</span
            ><ArrowRight v-if="i === 0" :size="12" />
          </div>
        </button>
      </article>
    </div>
  </section>
</template>
