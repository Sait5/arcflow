<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { computed } from 'vue'
import { ArrowUpRight, Check, RefreshCw } from 'lucide-vue-next'
import { projects } from '../../data/issues'
import { useWorkspace } from '../../composables/useWorkspace'
const { issues, project, section, selectedId, activeTeam, content } = useWorkspace()
const summaries = computed(() =>
  projects.map((p) => {
    const tasks = issues.value.filter((i) => i.project === p.id)
    return { ...p, tasks, done: tasks.filter((i) => i.status === 'Done').length }
  }),
)
function openProject(id: string) {
  project.value = id
  section.value = 'All issues'
}
</script>
<template>
  <div class="workspace-overview">
    <template v-if="section === 'Projects' || section === 'Roadmap'"
      ><div class="overview-intro">
        <h2>
          {{
            t(
              section === 'Roadmap'
                ? 'A direction everyone can see.'
                : 'Big ideas. Clear next steps.',
            )
          }}
        </h2>
        <p>
          {{
            t(
              section === 'Roadmap'
                ? 'Three projects, one shared vision. Select a milestone to explore its work.'
                : 'A focused overview of your team’s active projects.',
            )
          }}
        </p>
      </div>
      <button
        v-for="(p, i) in summaries"
        :key="p.id"
        class="project-overview-card"
        @click="openProject(p.id)"
      >
        <span class="project-symbol" :class="p.color">◇</span>
        <div>
          <h3>{{ content(p.name) }}</h3>
          <p>{{ t(p.tasks.length) }} {{ t('issues ·') }} {{ t(p.done) }} {{ t('completed') }}</p>
        </div>
        <span v-if="section === 'Roadmap' && !activeTeam" class="roadmap-quarter"
          >{{ t('Q') }}{{ t(i + 2) }} · {{ t(['Build', 'Explore', 'Refine'][i]) }}</span
        >
        <div class="project-progress">
          <span
            v-for="task in p.tasks"
            :key="task.id"
            :class="{ complete: task.status === 'Done', working: task.status === 'In Progress' }"
          ></span>
        </div>
        <ArrowUpRight :size="15" /></button></template
    ><template v-else-if="section === 'Cycles'"
      ><div class="overview-intro">
        <span class="eyebrow">{{ t('CURRENT CYCLE · 14 DAYS') }}</span>
        <h2>{{ t('Make space for steady progress.') }}</h2>
        <p>{{ t('Cycle 24 · Your team’s active work, moving in the same direction.') }}</p>
      </div>
      <div class="cycle-summary">
        <RefreshCw :size="22" /><strong
          >{{ t(issues.filter((i) => i.status === 'Done').length) }} /
          {{ t(issues.length) }}</strong
        ><span>{{ t('issues completed') }}</span>
      </div>
      <button
        v-for="issue in issues.filter((i) => i.status === 'In Progress' || i.status === 'Review')"
        :key="issue.id"
        class="activity-card"
        @click="selectedId = issue.id"
      >
        <span class="issue-id">{{ t(issue.id) }}</span
        ><strong>{{ content(issue.title) }}</strong
        ><span class="tag">{{ t(issue.status) }}</span
        ><ArrowUpRight :size="14" /></button></template
    ><template v-else
      ><div class="overview-intro">
        <h2>{{ t('A little context goes a long way.') }}</h2>
        <p>{{ t('Your team’s latest activity. Open an update to see the details.') }}</p>
      </div>
      <button
        v-for="issue in issues.slice(0, 3)"
        :key="issue.id"
        class="activity-card"
        @click="selectedId = issue.id"
      >
        <span class="activity-dot"></span>
        <div>
          <strong>{{ content(issue.title) }}</strong>
          <p>{{ t(issue.id) }} {{ t('· Ready for your attention') }}</p>
        </div>
        <ArrowUpRight :size="14" />
      </button>
      <div class="inbox-note">
        <Check :size="14" /> {{ t('You’re all caught up on the big picture.') }}
      </div></template
    >
  </div>
</template>
