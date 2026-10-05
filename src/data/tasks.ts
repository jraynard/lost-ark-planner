/** Recurring tasks for the checklist. Source: docs/progression-plan.md "Daily and scheduled loop". */
export interface Task {
  id: string
  label: string
  cadence: 'daily' | 'scheduled'
  /** Only shown for characters at or above this item level. */
  minIlvl: number
  /** Per character, or once for the whole roster. */
  scope: 'character' | 'roster'
  note?: string
}

export const tasks: Task[] = [
  {
    id: 'kurzan-front',
    label: 'Kurzan Front',
    cadence: 'daily',
    minIlvl: 1640,
    scope: 'character',
    note: 'Fate Ember gold is a bonus, not income.',
  },
  {
    id: 'guardian-raid',
    label: 'Guardian raid',
    cadence: 'daily',
    minIlvl: 1640,
    scope: 'character',
    note: 'Check accessory and bracelet drops before dismantling.',
  },
  {
    id: 'chaos-gate',
    label: 'Chaos Gate (if scheduled)',
    cadence: 'scheduled',
    minIlvl: 0,
    scope: 'roster',
    note: 'Check the in-game calendar; run on your highest characters.',
  },
  {
    id: 'adventure-island',
    label: 'Adventure Island (gold days)',
    cadence: 'scheduled',
    minIlvl: 0,
    scope: 'roster',
    note: '2,373–3,630 gold at 1700–1719.',
  },
]

/** Event item-level milestones; see docs/in-game-checks.md. Events end Jan 20, 2027. */
export const eventMilestones = [1705, 1710, 1715, 1720]
