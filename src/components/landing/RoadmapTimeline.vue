<script setup lang="ts">
import { useLocale } from '../../composables/useLocale'
const { t } = useLocale()
import { useRouter } from 'vue-router'
import { useWorkspace } from '../../composables/useWorkspace'
const router = useRouter()
const { project, section, status, query } = useWorkspace()
const milestones = [
  { id: 'website', name: 'Website v2', class: 'milestone-one' },
  { id: 'mobile', name: 'Mobile experience', class: 'milestone-two' },
  { id: 'design', name: 'Design system', class: 'milestone-three' },
  { id: 'website', name: 'Analytics dashboard', class: 'milestone-four' },
  { id: 'website', name: 'Release v2.4', class: 'milestone-five' },
]
function open(id: string) {
  project.value = id
  section.value = 'All issues'
  status.value = 'all'
  query.value = ''
  router.push('/workspace')
}
</script>
<template>
  <div class="roadmap-timeline">
    <div class="roadmap-months">
      <span>{{ t('October') }}</span
      ><span>{{ t('November') }}</span
      ><span>{{ t('December') }}</span>
    </div>
    <div class="roadmap-dates">
      <span v-for="n in 12" :key="n">{{
        t([1, 8, 15, 22, 1, 8, 15, 22, 1, 8, 15, 22][n - 1])
      }}</span>
    </div>
    <div class="roadmap-lanes">
      <div v-for="m in milestones" :key="m.name" class="roadmap-lane">
        <button class="roadmap-milestone" :class="m.class" @click="open(m.id)">
          <span>◇</span>{{ t(m.name) }}
        </button>
      </div>
      <div class="roadmap-today"><span>14</span></div>
    </div>
  </div>
</template>
