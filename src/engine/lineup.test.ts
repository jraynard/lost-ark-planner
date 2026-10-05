import { describe, expect, it } from 'vitest'
import { seedRoster } from '../data/seed-roster'
import { bestLineup, rosterSummary } from './lineup'

const solo = (ilvl: number) => ({ ilvl, learnedRaids: [] })
const ids = (l: ReturnType<typeof bestLineup>) => l.raids.map((r) => r.id)

// Fixtures are the totals from docs/progression-plan.md.
describe('bestLineup', () => {
  it('main at 1704: Act 4 / Act 3 / Act 2 Solo = 64,500', () => {
    const l = bestLineup(solo(1704))
    expect(ids(l)).toEqual(['act4-solo', 'act3-solo', 'act2-solo'])
    expect(l.total).toBe(64500)
  })

  it('main at 1710: Final Day / Act 4 / Act 3 Solo = 80,000', () => {
    const l = bestLineup(solo(1710))
    expect(ids(l)).toEqual(['final-day-solo', 'act4-solo', 'act3-solo'])
    expect(l.total).toBe(80000)
  })

  // Thaemine Solo (6,400, confirmed in game) beats Echidna and wasn't in the plan doc's alt totals.
  it('1660 alt: Aegir + Thaemine + Echidna Solo = 24,000', () => {
    const l = bestLineup(solo(1660))
    expect(ids(l)).toEqual(['aegir-solo', 'thaemine-solo', 'echidna-solo'])
    expect(l.total).toBe(24000)
    expect(l.hasUnknownGold).toBe(false)
  })

  it('alt targets: 1670 = 34,400, 1680 = 49,000', () => {
    expect(bestLineup(solo(1670)).total).toBe(34400)
    expect(bestLineup(solo(1680)).total).toBe(49000)
  })

  it('learned Horizon Cathedral 1 at 1704 replaces Act 2 Solo (+13,500)', () => {
    const l = bestLineup({ ilvl: 1704, learnedRaids: ['horizon-1'] })
    expect(ids(l)).toEqual(['horizon-1', 'act4-solo', 'act3-solo'])
    expect(l.total).toBe(78000)
  })

  it('1710 with Serca and Horizon Cathedral 1 learned = 94,000', () => {
    const l = bestLineup({ ilvl: 1710, learnedRaids: ['horizon-1', 'serca-matchmaking'] })
    expect(l.total).toBe(94000)
  })

  it('never claims two modes of the same raid', () => {
    const l = bestLineup({ ilvl: 1730, learnedRaids: ['final-day-hard', 'final-day-normal'] })
    const families = l.raids.map((r) => r.family)
    expect(new Set(families).size).toBe(families.length)
  })

  it('splits gold by binding', () => {
    const l = bestLineup({ ilvl: 1704, learnedRaids: ['horizon-1'] })
    expect(l.breakdown).toEqual({ tradable: 24000, roster: 24000, character: 30000 })
  })
})

describe('rosterSummary', () => {
  it('sums only gold earners', () => {
    const s = rosterSummary(seedRoster)
    expect(s.goldEarnerCount).toBe(4)
    expect(s.overCap).toBe(false)
    // 64,500 + 64,500 + 24,000 + 12,500 (Miriyanah: Thaemine + Echidna)
    expect(s.total).toBe(165500)
  })
})
