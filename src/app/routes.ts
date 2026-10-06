export interface NavItem {
  path: string
  label: string
  icon: string
}

export const navItems: NavItem[] = [
  { path: '/roster', label: 'Roster', icon: '👥' },
  { path: '/planner', label: 'Planner', icon: '💰' },
  { path: '/advisor', label: 'Advisor', icon: '📈' },
  { path: '/checklist', label: 'Checklist', icon: '✅' },
  { path: '/triage', label: 'Triage', icon: '🎒' },
  { path: '/data', label: 'Data', icon: '💾' },
]
