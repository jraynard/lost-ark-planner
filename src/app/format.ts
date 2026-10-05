import type { GoldType } from '../data/raids'

export const formatGold = (n: number) => Math.round(n).toLocaleString('en-US')

export const goldTypeLabels: Record<GoldType, string> = {
  tradable: 'Tradable',
  split: '½ tradable · ½ roster',
  roster: 'Roster-bound',
  character: 'Character-bound',
}
