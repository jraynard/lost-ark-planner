import { PIECE_ILVL_PER_NORMAL } from './honing'
import type { GearLevel, GearSlot } from './types'

export const GEAR_SLOTS: GearSlot[] = ['helmet', 'shoulders', 'chest', 'pants', 'gloves', 'weapon']

/** Item level of T4 gear at +0 normal, +0 advanced (derived from in-game checks, 2026-10-05). */
export const T4_BASE_ILVL = 1590

/** T4 item level: base + average over the six pieces of (5 × normal + advanced). */
export function ilvlFromGear(gear: Record<GearSlot, GearLevel>): number {
  const pieceSum = GEAR_SLOTS.reduce(
    (sum, slot) => sum + gear[slot].normal * PIECE_ILVL_PER_NORMAL + gear[slot].advanced,
    0,
  )
  return T4_BASE_ILVL + pieceSum / GEAR_SLOTS.length
}

/** Item levels are shown truncated to 2 decimals, as in game. */
export function formatIlvl(ilvl: number): string {
  return (Math.floor(ilvl * 100 + 1e-6) / 100).toFixed(2)
}

export function uniformGear(normal: number, advanced: number): Record<GearSlot, GearLevel> {
  return Object.fromEntries(GEAR_SLOTS.map((s) => [s, { normal, advanced }])) as Record<GearSlot, GearLevel>
}
