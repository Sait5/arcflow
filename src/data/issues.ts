import { reactive } from 'vue'
export type Status = 'Backlog' | 'Todo' | 'In Progress' | 'Review' | 'Done'
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low'
export interface User {
  id: string
  name: string
  initials: string
  color: string
}
export interface Project {
  id: string
  name: string
  color: string
}
export interface Issue {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assignee: string
  project: string
  labels: string[]
  version?: number
}
export const statuses: Status[] = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done']
export const priorities: Priority[] = ['Urgent', 'High', 'Medium', 'Low']
export const users = reactive<User[]>([
  { id: 'alex', name: 'Alex Morgan', initials: 'AM', color: 'lavender' },
  { id: 'mia', name: 'Mia Chen', initials: 'MC', color: 'sand' },
  { id: 'sam', name: 'Sam Rivera', initials: 'SR', color: 'sage' },
])
export const projects = reactive<Project[]>([
  { id: 'website', name: 'Website v2', color: 'lavender' },
  { id: 'mobile', name: 'Mobile app', color: 'sage' },
  { id: 'design', name: 'Design system', color: 'sand' },
])
export const initialIssues: Issue[] = [
  {
    id: 'ARC-128',
    title: 'Improve onboarding flow',
    description:
      'Make the first five minutes feel effortless. Simplify workspace setup, clarify the welcome checklist, and help new teams reach their first shared milestone.',
    status: 'In Progress',
    priority: 'High',
    assignee: 'alex',
    project: 'website',
    labels: ['Experience'],
  },
  {
    id: 'ARC-129',
    title: 'Mobile navigation polish',
    description:
      'Refine transitions and touch targets in the mobile navigation. Make every destination easy to find with one hand.',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'mia',
    project: 'mobile',
    labels: ['Design'],
  },
  {
    id: 'ARC-130',
    title: 'Analytics dashboard',
    description:
      'Give teams a focused overview of activation, retention, and the metrics that matter. Include accessible chart labels and empty states.',
    status: 'Todo',
    priority: 'High',
    assignee: 'sam',
    project: 'website',
    labels: ['Feature'],
  },
  {
    id: 'ARC-131',
    title: 'Design token migration',
    description:
      'Move shared colors, spacing, and typography into our unified token system. Document the migration path for every component.',
    status: 'Review',
    priority: 'Medium',
    assignee: 'mia',
    project: 'design',
    labels: ['Foundation'],
  },
  {
    id: 'ARC-132',
    title: 'Release v2.4',
    description:
      'Prepare the release checklist, review final QA, and publish the updated product experience.',
    status: 'Done',
    priority: 'Urgent',
    assignee: 'alex',
    project: 'website',
    labels: ['Release'],
  },
  {
    id: 'ARC-133',
    title: 'Improve search performance',
    description:
      'Reduce query latency and make search results appear as the user types. Verify behavior across large workspaces.',
    status: 'Backlog',
    priority: 'Low',
    assignee: 'sam',
    project: 'website',
    labels: ['Engineering'],
  },
  {
    id: 'ARC-134',
    title: 'Build a better empty state',
    description:
      'Turn empty screens into useful starting points with clear next steps and concise guidance.',
    status: 'Todo',
    priority: 'Low',
    assignee: 'mia',
    project: 'mobile',
    labels: ['Experience'],
  },
  {
    id: 'ARC-135',
    title: 'Keyboard shortcuts',
    description:
      'Make everyday actions available from the keyboard and document shortcuts in the command menu.',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'alex',
    project: 'design',
    labels: ['Feature'],
  },
]
