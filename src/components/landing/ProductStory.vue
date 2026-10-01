<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t, locale } = useLocale()
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  ChevronDown,
  Layers,
  SlidersHorizontal,
  MessageSquare,
  CircleDot,
  GitBranch,
  CalendarDays,
  Flag,
  FileText,
  Bell,
  UsersRound,
  ArrowUpRight,
  RefreshCw,
  Check,
  SignalHigh,
} from 'lucide-vue-next'
import { useWorkspace } from '../../composables/useWorkspace'
import { useReveal } from '../../composables/useMotion'
import StatusIcon from '../ui/StatusIcon.vue'
import CycleChart from './CycleChart.vue'
import RoadmapTimeline from './RoadmapTimeline.vue'
const props = defineProps<{ kind: 'issues' | 'cycles' | 'roadmap' }>()
const router = useRouter()
const { issues, selectedId, createIssue, project, status, section, query } = useWorkspace()
const title = ref(t('Improve onboarding flow'))
const description = ref(t('A clearer first step for every new team.'))
watch(locale, () => {
  if (['Improve onboarding flow', 'Улучшить первый запуск'].includes(title.value))
    title.value = t('Improve onboarding flow')
  if (
    [
      'A clearer first step for every new team.',
      'Понятный первый шаг для каждой команды.',
    ].includes(description.value)
  )
    description.value = t('A clearer first step for every new team.')
})
const reveal = useReveal()
const copy = computed(
  () =>
    ({
      issues: {
        id: 'features',
        title: 'A home for every detail.',
        second: 'Space for every idea.',
        description:
          'Capture the next step, share the context, and keep\nyour work moving in views that feel natural to you.',
        features: [
          {
            icon: GitBranch,
            title: 'Connected work.',
            text: 'Break big ideas into clear, actionable issues.',
          },
          {
            icon: Layers,
            title: 'Thoughtful workflows.',
            text: 'A place for every stage, from idea to done.',
          },
          {
            icon: CircleDot,
            title: 'Your own rhythm.',
            text: 'Shape statuses around the way your team works.',
          },
          {
            icon: SlidersHorizontal,
            title: 'Focused views.',
            text: 'See exactly what matters, when it matters.',
          },
          {
            icon: MessageSquare,
            title: 'Shared context.',
            text: 'Keep conversations close to the work.',
          },
          {
            icon: FileText,
            title: 'A better starting point.',
            text: 'Give recurring work a useful structure.',
          },
        ],
      },
      cycles: {
        id: 'changelog',
        title: 'Make progress a habit.',
        second: 'Find your team’s rhythm.',
        description:
          'A clear focus for what comes next. Build a healthy\ncadence, protect your attention, and keep moving.',
        features: [
          {
            icon: RefreshCw,
            title: 'A fresh start.',
            text: 'Bring unfinished work into the next cycle.',
          },
          {
            icon: CalendarDays,
            title: 'A steady cadence.',
            text: 'Plan the next two weeks with your team.',
          },
          {
            icon: SlidersHorizontal,
            title: 'Flexible by design.',
            text: 'Choose the dates and pace that work for you.',
          },
          {
            icon: Flag,
            title: 'Early signals.',
            text: 'Spot delays before they become roadblocks.',
          },
          {
            icon: Layers,
            title: 'Room to adapt.',
            text: 'Understand the work added along the way.',
          },
          {
            icon: Check,
            title: 'Ready for next.',
            text: 'Prepare tomorrow’s cycle without losing focus.',
          },
        ],
      },
      roadmap: {
        id: 'roadmaps',
        title: 'See beyond the next step.',
        second: 'Build toward the bigger picture.',
        description:
          'Turn a shared vision into a clear direction. Plan\nacross teams and make every milestone meaningful.',
        features: [
          {
            icon: UsersRound,
            title: 'One shared direction.',
            text: 'Connect teams around a common outcome.',
          },
          {
            icon: FileText,
            title: 'Context that stays close.',
            text: 'Keep plans and decisions with each project.',
          },
          {
            icon: Layers,
            title: 'Your own roadmap.',
            text: 'Organize projects across meaningful horizons.',
          },
          {
            icon: CalendarDays,
            title: 'A visual path.',
            text: 'See the product journey take shape over time.',
          },
          {
            icon: CircleDot,
            title: 'Progress in perspective.',
            text: 'Follow scope, delivery, and team momentum.',
          },
          {
            icon: Bell,
            title: 'Everyone in the loop.',
            text: 'Keep the latest updates easy to find.',
          },
        ],
      },
    })[props.kind],
)
function create() {
  if (!title.value.trim()) return
  void createIssue(title.value.trim(), description.value)
}
function openWorkspace(view = 'All issues') {
  project.value = 'all'
  status.value = 'all'
  query.value = ''
  section.value = view
  router.push('/workspace')
}
</script>
<template>
  <section :id="copy.id" class="product-story" :class="`story-${kind}`">
    <div class="container">
      <div class="center-heading" v-motion="reveal">
        <h2>
          {{ t(copy.title) }}<br /><span>{{ t(copy.second) }}</span>
        </h2>
      </div>
      <div class="story-main-visual" v-motion="useReveal(100)">
        <form v-if="kind === 'issues'" class="issue-composer" @submit.prevent="create">
          <div class="composer-breadcrumb">
            <span>{{ t('◇ Product') }}</span
            ><span>{{ t('▤ New issue') }}</span>
          </div>
          <input
            v-model="title"
            :aria-label="t('New issue title')"
            maxlength="120"
            required
          /><textarea
            v-model="description"
            :aria-label="t('New issue description')"
            rows="2"
          ></textarea>
          <div class="composer-properties">
            <span><StatusIcon status="Todo" />{{ t('Todo') }} <ChevronDown :size="10" /></span
            ><span><SignalHigh :size="11" />{{ t('Medium') }}</span
            ><span
              ><span class="avatar lavender">{{ t('AM') }}</span
              >{{ t('Alex Morgan') }}</span
            ><span>{{ t('◇ Website v2') }}</span>
          </div>
          <div class="composer-bottom">
            <small>{{ t('⌘ ↵ · A small idea, a clear next step') }}</small
            ><button class="button button-small" type="submit">
              {{ t('Create issue') }} <Plus :size="12" />
            </button>
          </div>
        </form>
        <CycleChart v-else-if="kind === 'cycles'" /><RoadmapTimeline v-else />
      </div>
      <p class="story-description" v-motion="reveal">{{ t(copy.description) }}</p>
      <div class="story-capabilities" v-motion="reveal">
        <p v-for="feature in copy.features" :key="feature.title">
          <component :is="feature.icon" :size="13" /><span
            ><strong>{{ t(feature.title) }}</strong> {{ t(feature.text) }}</span
          >
        </p>
      </div>
      <div v-if="kind === 'issues'" class="story-detail-cards">
        <article class="story-detail-card" v-motion="useReveal()">
          <h3>{{ t('See it your way') }}</h3>
          <p>
            {{ t('Switch between list and board.') }}<br />{{
              t('Different perspectives, the same shared context.')
            }}
          </p>
          <div class="mini-board">
            <div v-for="s in ['Todo', 'In Progress', 'Review']" :key="s">
              <span>{{ t(s) }}</span
              ><button
                v-for="issue in issues.filter((i) => i.status === s).slice(0, 2)"
                :key="issue.id"
                @click="selectedId = issue.id"
              >
                <small>{{ t(issue.id) }}</small
                >{{ t(issue.title) }}<span class="tag">{{ t(issue.labels[0]) }}</span>
              </button>
            </div>
          </div>
          <button class="card-action" @click="openWorkspace()">
            {{ t('Explore your workspace') }} <ArrowUpRight :size="13" />
          </button>
        </article>
        <article class="story-detail-card" v-motion="useReveal(100)">
          <h3>{{ t('Make room for focus') }}</h3>
          <p>
            {{ t('A few useful filters.') }}<br />{{ t('The right work, right in front of you.') }}
          </p>
          <div class="mini-filter">
            <div class="mini-filter-header">
              <SlidersHorizontal :size="13" /> {{ t('My focus') }} <span>{{ t('2 filters') }}</span>
            </div>
            <div class="mini-filter-chips">
              <span>{{ t('◉ In Progress') }}</span
              ><span>{{ t('◇ Website v2') }}</span>
            </div>
            <button
              v-for="issue in issues.slice(0, 3)"
              :key="issue.id"
              @click="selectedId = issue.id"
            >
              <StatusIcon :status="issue.status" />{{ t(issue.title) }}
            </button>
          </div>
          <button class="card-action" @click="openWorkspace('My issues')">
            {{ t('Find your focus') }} <ArrowUpRight :size="13" />
          </button>
        </article>
      </div>
      <div v-else-if="kind === 'roadmap'" class="story-detail-cards">
        <article class="story-detail-card" v-motion="useReveal()">
          <h3>{{ t('Keep the story moving') }}</h3>
          <p>
            {{ t('Share progress, celebrate a milestone,') }}<br />{{
              t('and give your team the context they need.')
            }}
          </p>
          <div class="project-update">
            <div>
              <span class="avatar sage">{{ t('SR') }}</span
              ><span
                >{{ t('Sam Rivera') }}<small>{{ t('Project update · just now') }}</small></span
              ><span class="tag">{{ t('On track') }}</span>
            </div>
            <h4>{{ t('The next chapter is taking shape.') }}</h4>
            <p>
              {{
                t(
                  'Onboarding is ready for review. The team is focused on the details ahead of our next release.',
                )
              }}
            </p>
            <span class="update-reactions"
              >✓ 3 &nbsp; ✦ 2 &nbsp; <MessageSquare :size="11" /> 4</span
            >
          </div>
          <button class="card-action" @click="openWorkspace('Projects')">
            {{ t('See project updates') }} <ArrowUpRight :size="13" />
          </button>
        </article>
        <article class="story-detail-card" v-motion="useReveal(100)">
          <h3>{{ t('Bring the picture together') }}</h3>
          <p>
            {{ t('Your projects, your teams, your priorities.') }}<br />{{
              t('One view that puts it all in perspective.')
            }}
          </p>
          <div class="mini-roadmap">
            <div>
              <span>{{ t('Q4 Roadmap') }}</span
              ><span>{{ t('Product Growth Design') }}</span>
            </div>
            <RoadmapTimeline />
          </div>
          <button class="card-action" @click="openWorkspace('Roadmap')">
            {{ t('Explore the roadmap') }} <ArrowUpRight :size="13" />
          </button>
        </article>
      </div>
      <button v-else class="story-link text-button" @click="openWorkspace('Cycles')">
        {{ t('Explore your current cycle') }} <ArrowUpRight :size="14" />
      </button>
    </div>
  </section>
</template>
