import { describe, expect, it } from 'vitest'
import { bundledGameData } from '../data/game'
import type { GameData } from '../data/schema'
import { seedRoster } from '../data/seed-roster'
import { expectedAdvancedTaps, expectedNormalTaps, goldEquivalent, planToIlvl, specialHoningOptions } from './honing-cost'
import { ilvlFromGear } from './ilvl'

const mechanics = bundledGameData.honing.mechanics
const smokesensiGear = seedRoster[0].gear!

describe('expectedNormalTaps', () => {
  it('is one tap at 100%', () => {
    expect(expectedNormalTaps(1, mechanics)).toEqual({ expected: 1, worstCase: 1 })
  })

  it('matches a hand calculation at 50% base', () => {
    // Rates 50/55/60/65%, energy 0.233 → 0.488 → 0.767 → 1.069: tap 5 is guaranteed.
    // 1 + .5 + .5·.45 + .5·.45·.4 + .5·.45·.4·.35 = 1.8465
    const { expected, worstCase } = expectedNormalTaps(0.5, mechanics)
    expect(expected).toBeCloseTo(1.8465, 4)
    expect(worstCase).toBe(5)
  })

  it('caps the fail bonus at 2× base and always ends at full Artisan’s Energy', () => {
    const { expected, worstCase } = expectedNormalTaps(0.03, mechanics)
    expect(worstCase).toBeLessThan(60)
    expect(expected).toBeGreaterThan(1)
    expect(expected).toBeLessThan(worstCase)
  })

  it('starts closer to a guarantee with Artisan’s Energy built up', () => {
    expect(expectedNormalTaps(0.05, mechanics, 0.9).worstCase).toBeLessThan(expectedNormalTaps(0.05, mechanics).worstCase)
  })
})

describe('expectedAdvancedTaps', () => {
  const band = bundledGameData.honing.advanced[0]
  it('is XP per level over expected XP per tap', () => {
    const filled = { ...band, xpPerLevel: 100, outcomes: [{ chance: 0.8, xp: 10 }, { chance: 0.15, xp: 20 }, { chance: 0.05, xp: 40 }] }
    expect(expectedAdvancedTaps(filled)).toBeCloseTo(100 / 13)
  })
  it('is null until XP values are known', () => {
    expect(expectedAdvancedTaps(band)).toBeNull()
  })
})

describe('goldEquivalent', () => {
  it('values materials and lists unpriced ones', () => {
    const cost = { materials: { 'destiny-leapstone': 10, 'abidos-fusion': 2 }, gold: 100 }
    expect(goldEquivalent(cost, { 'destiny-leapstone': 5 })).toEqual({ gold: 150, unpriced: ['abidos-fusion'] })
  })
})

/** Bundled data with the gaps filled by made-up test values. */
function filledData(): GameData {
  const data = structuredClone(bundledGameData)
  for (const band of data.honing.advanced) {
    band.xpPerLevel = 100
    band.outcomes = [{ chance: 0.8, xp: 100 }, { chance: 0.15, xp: 200 }, { chance: 0.05, xp: 400 }]
  }
  for (const step of data.honing.normal) step.baseRate = 0.03
  return data
}
const prices = { 'destiny-guardian-stone': 1, 'destiny-destruction-stone': 2, 'destiny-leapstone': 20, 'abidos-fusion': 50 }

describe('planToIlvl', () => {
  it('takes Smokesensi to 1710 with the cheapest advanced armor levels', () => {
    const plan = planToIlvl(smokesensiGear, 1710, filledData(), prices)
    expect(plan.reachesTarget).toBe(true)
    expect(plan.moves).toHaveLength(26)
    expect(new Set(plan.moves.map((m) => m.slot))).toEqual(new Set(['helmet', 'shoulders', 'chest']))
    expect(plan.moves.every((m) => m.kind === 'advanced')).toBe(true)
    expect(plan.unpriced).toEqual([])

    const after = structuredClone(smokesensiGear)
    for (const m of plan.moves) after[m.slot].advanced = m.to
    expect(ilvlFromGear(after)).toBeGreaterThanOrEqual(1710)
  })

  it('reports the data it is missing instead of guessing', () => {
    const plan = planToIlvl(smokesensiGear, 1710, bundledGameData, {})
    expect(plan.reachesTarget).toBe(false)
    expect(plan.moves).toHaveLength(0)
    expect(plan.missing).toContain('advanced 20→21 armor: XP per outcome and per level')
    expect(plan.missing).toContain('normal +18 armor: base success rate')
  })
})

describe('specialHoningOptions', () => {
  it('ranks armor at +18 above the weapon at +19 (0.15% vs 0.03% per stone)', () => {
    const options = specialHoningOptions(smokesensiGear, bundledGameData)
    expect(options[0]).toMatchObject({ slot: 'helmet', chancePerStone: 0.0015, expectedStonesPerSuccess: expect.closeTo(666.67, 1) })
    expect(options.at(-1)).toMatchObject({ slot: 'weapon', chancePerStone: 0.0003, expectedStonesPerSuccess: expect.closeTo(3333.33, 1) })
  })
})
