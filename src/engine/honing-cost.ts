import type { AdvancedBand, GameData, MaterialId, NormalStep, PieceType, TapCost } from '../data/schema'
import { PIECE_ILVL_PER_NORMAL } from './honing'
import { GEAR_SLOTS, ilvlFromGear } from './ilvl'
import type { GearLevel, GearSlot } from './types'

export type Mechanics = GameData['honing']['mechanics']
export type MaterialPrices = Partial<Record<MaterialId, number | null>>
export type Materials = Partial<Record<MaterialId, number>>

export interface Cost {
  materials: Materials
  gold: number
}

/** Expected taps for one normal honing level, from base rate, fail bonus and Artisan's Energy. */
export function expectedNormalTaps(baseRate: number, mechanics: Mechanics, startEnergy = 0): { expected: number; worstCase: number } {
  if (baseRate <= 0) return { expected: Infinity, worstCase: Infinity }
  let expected = 0
  let reach = 1 // probability this tap happens
  let energy = startEnergy
  for (let fails = 0; ; fails++) {
    expected += reach
    if (energy >= 1 - 1e-9) return { expected, worstCase: fails + 1 }
    const rate = Math.min(baseRate * (1 + mechanics.failBonus * fails), baseRate * mechanics.maxRateMultiplier, 1)
    if (rate >= 1) return { expected, worstCase: fails + 1 }
    reach *= 1 - rate
    energy += rate * mechanics.artisanPerFail
  }
}

/** Expected taps for one advanced honing level: XP needed over expected XP per tap. */
export function expectedAdvancedTaps(band: AdvancedBand): number | null {
  if (band.xpPerLevel === null || band.outcomes.some((o) => o.xp === null)) return null
  const xpPerTap = band.outcomes.reduce((sum, o) => sum + o.chance * (o.xp ?? 0), 0)
  return xpPerTap > 0 ? band.xpPerLevel / xpPerTap : null
}

export function scaleCost(tap: TapCost, taps: number): Cost {
  const materials: Materials = {}
  for (const [id, qty] of Object.entries(tap.materials) as [MaterialId, number][]) materials[id] = qty * taps
  return { materials, gold: tap.gold * taps }
}

export function addCosts(a: Cost, b: Cost): Cost {
  const materials: Materials = { ...a.materials }
  for (const [id, qty] of Object.entries(b.materials) as [MaterialId, number][]) materials[id] = (materials[id] ?? 0) + qty
  return { materials, gold: a.gold + b.gold }
}

/** Gold plus materials valued at `prices`; materials without a price are listed in `unpriced`. */
export function goldEquivalent(cost: Cost, prices: MaterialPrices): { gold: number; unpriced: MaterialId[] } {
  let gold = cost.gold
  const unpriced: MaterialId[] = []
  for (const [id, qty] of Object.entries(cost.materials) as [MaterialId, number][]) {
    const price = prices[id]
    if (price == null) unpriced.push(id)
    else gold += qty * price
  }
  return { gold, unpriced }
}

export const pieceType = (slot: GearSlot): PieceType => (slot === 'weapon' ? 'weapon' : 'armor')

export interface HoningMove {
  slot: GearSlot
  kind: 'normal' | 'advanced'
  from: number
  to: number
  /** Piece levels gained: 5 for normal, 1 for advanced. */
  gain: number
  cost: Cost
  goldEquivalent: number
}

/** What a step needs that the game data doesn't have yet, e.g. "normal +18 armor: base rate". */
export type MissingData = string

function normalMove(slot: GearSlot, level: GearLevel, data: GameData, prices: MaterialPrices, energy: number): HoningMove | MissingData {
  const piece = pieceType(slot)
  const step: NormalStep | undefined = data.honing.normal.find((s) => s.from === level.normal && s.piece === piece)
  const label = `normal +${level.normal} ${piece}`
  if (!step || !step.cost) return `${label}: cost per tap`
  if (step.baseRate === null) return `${label}: base success rate`
  const cost = scaleCost(step.cost, expectedNormalTaps(step.baseRate, data.honing.mechanics, energy).expected)
  return { slot, kind: 'normal', from: level.normal, to: level.normal + 1, gain: PIECE_ILVL_PER_NORMAL, cost, goldEquivalent: goldEquivalent(cost, prices).gold }
}

function advancedMove(slot: GearSlot, level: GearLevel, data: GameData, prices: MaterialPrices): HoningMove | MissingData {
  const piece = pieceType(slot)
  const to = level.advanced + 1
  const band = data.honing.advanced.find((b) => b.piece === piece && to > b.fromLevel && to <= b.toLevel)
  const label = `advanced ${level.advanced}→${to} ${piece}`
  if (!band || !band.cost) return `${label}: cost per tap`
  const taps = expectedAdvancedTaps(band)
  if (taps === null) return `${label}: XP per outcome and per level`
  const cost = scaleCost(band.cost, taps)
  return { slot, kind: 'advanced', from: level.advanced, to, gain: 1, cost, goldEquivalent: goldEquivalent(cost, prices).gold }
}

export interface HoningPlan {
  /** Cheapest-first moves that reach the target (or as far as the data allows). */
  moves: HoningMove[]
  total: Cost
  totalGoldEquivalent: number
  reachesTarget: boolean
  /** Data gaps that blocked or limited the plan. */
  missing: MissingData[]
  /** Materials without a price: the cheapest-first order ignores their cost. */
  unpriced: MaterialId[]
}

const MAX_ADVANCED = 40
const MAX_NORMAL = 25

/**
 * Greedy plan to reach `targetIlvl`: repeatedly take the move with the lowest gold-equivalent per
 * piece level across all six pieces. Normal moves assume Artisan's Energy from `energy` (default 0).
 */
export function planToIlvl(
  gear: Record<GearSlot, GearLevel>,
  targetIlvl: number,
  data: GameData,
  prices: MaterialPrices,
  energy: Partial<Record<GearSlot, number>> = {},
): HoningPlan {
  const current = structuredClone(gear)
  const moves: HoningMove[] = []
  const missing = new Set<MissingData>()
  let needed = Math.ceil((targetIlvl - ilvlFromGear(gear)) * GEAR_SLOTS.length - 1e-6)

  while (needed > 0) {
    let best: HoningMove | null = null
    for (const slot of GEAR_SLOTS) {
      const level = current[slot]
      const options = [
        level.advanced < MAX_ADVANCED ? advancedMove(slot, level, data, prices) : null,
        level.normal < MAX_NORMAL ? normalMove(slot, level, data, prices, moves.some((m) => m.slot === slot && m.kind === 'normal') ? 0 : (energy[slot] ?? 0)) : null,
      ]
      for (const option of options) {
        if (option === null) continue
        if (typeof option === 'string') {
          missing.add(option)
          continue
        }
        if (!best || option.goldEquivalent / option.gain < best.goldEquivalent / best.gain) best = option
      }
    }
    if (!best) break
    moves.push(best)
    if (best.kind === 'normal') current[best.slot].normal = best.to
    else current[best.slot].advanced = best.to
    needed -= best.gain
  }

  const total = moves.reduce((sum, m) => addCosts(sum, m.cost), { materials: {}, gold: 0 } as Cost)
  const { gold, unpriced } = goldEquivalent(total, prices)
  return { moves, total, totalGoldEquivalent: gold, reachesTarget: needed <= 0, missing: [...missing], unpriced }
}

export interface SpecialHoningOption {
  slot: GearSlot
  targetLevel: number
  chance: number
  stonesPerAttempt: number
  expectedStonesPerSuccess: number
  /** Success chance per stone spent: the number to compare between pieces. */
  chancePerStone: number
}

/** Pieces where a special honing attempt is possible, best chance per stone first. */
export function specialHoningOptions(gear: Record<GearSlot, GearLevel>, data: GameData): SpecialHoningOption[] {
  const { stonesPerAttempt, chanceByTargetLevel } = data.honing.special
  return GEAR_SLOTS.flatMap((slot) => {
    const targetLevel = gear[slot].normal + 1
    const chance = chanceByTargetLevel[String(targetLevel)]
    const stones = stonesPerAttempt[pieceType(slot)]
    if (!chance || !stones) return []
    return [{ slot, targetLevel, chance, stonesPerAttempt: stones, expectedStonesPerSuccess: stones / chance, chancePerStone: chance / stones }]
  }).sort((a, b) => b.chancePerStone - a.chancePerStone)
}
