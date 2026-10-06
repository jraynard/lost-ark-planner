import type { GoldType, MaterialId } from '../data/schema'
import type { Materials } from '../engine/honing-cost'
import type { GearSlot } from '../engine/types'

export const formatGold = (n: number) => Math.round(n).toLocaleString('en-US')

export const goldTypeLabels: Record<GoldType, string> = {
  tradable: 'Tradable',
  split: '½ tradable · ½ roster',
  roster: 'Roster-bound',
  character: 'Character-bound',
}

export const materialLabels: Record<MaterialId, string> = {
  'destiny-guardian-stone': 'Destiny Guardian Stone',
  'destiny-destruction-stone': 'Destiny Destruction Stone',
  'destiny-leapstone': 'Destiny Leapstone',
  'abidos-fusion': 'Abidos Fusion Material',
}

export const slotLabels: Record<GearSlot, string> = {
  helmet: 'Helmet',
  shoulders: 'Shoulders',
  chest: 'Chest',
  pants: 'Pants',
  gloves: 'Gloves',
  weapon: 'Weapon',
}

/** "12,300 Destiny Guardian Stone · 230 Destiny Leapstone" */
export function formatMaterials(materials: Materials): string {
  return (Object.entries(materials) as [MaterialId, number][])
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => `${formatGold(qty)} ${materialLabels[id]}`)
    .join(' · ')
}
