/**
 * Honing tap costs read off Smokesensi's honing window on 2026-10-05 (docs/in-game-checks.md).
 * Not used by the engine yet; gaps are null until checked.
 */
export interface TapCost {
  guardianStones?: number
  destructionStones?: number
  leapstones: number
  fusion: number
  gold: number
}

export interface HoningStep {
  step: string
  piece: 'armor' | 'weapon'
  cost: TapCost | null
  /** Base success chance, 0–1; null = not recorded. */
  successRate: number | null
}

/** Advanced honing outcome odds per tap: success, great success, great success x2. */
export const advancedHoningOutcomes = { success: 0.8, great: 0.15, greatX2: 0.05 }

export const honingSteps: HoningStep[] = [
  { step: 'advanced-current', piece: 'armor', cost: { guardianStones: 1000, leapstones: 18, fusion: 17, gold: 2000 }, successRate: 1 },
  { step: 'advanced-current', piece: 'weapon', cost: { destructionStones: 1200, leapstones: 25, fusion: 28, gold: 3000 }, successRate: 1 },
  { step: 'normal-18-19', piece: 'armor', cost: { guardianStones: 1620, leapstones: 25, fusion: 15, gold: 2110 }, successRate: null },
  { step: 'normal-18-19', piece: 'weapon', cost: null, successRate: null },
  { step: 'normal-19-20', piece: 'armor', cost: null, successRate: null },
  { step: 'normal-19-20', piece: 'weapon', cost: { destructionStones: 2950, leapstones: 45, fusion: 35, gold: 3830 }, successRate: null },
]

/**
 * Special honing chance depends on the level being attempted, not on armor vs weapon:
 * 3% for +18 → +19, 1.5% for +19 → +20. Stone cost per attempt: armor 20, weapon 50.
 */
export const specialHoning = {
  chanceByTargetLevel: { 19: 0.03, 20: 0.015 } as Record<number, number>,
  stonesPerAttempt: { armor: 20, weapon: 50 },
}
