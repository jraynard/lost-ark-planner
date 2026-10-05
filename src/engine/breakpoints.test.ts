import { describe, expect, it } from 'vitest'
import { seedRoster } from '../data/seed-roster'
import { nextBreakpoint, rankBreakpoints } from './breakpoints'
import { honingEstimate } from './honing'

describe('nextBreakpoint', () => {
  it('main at 1705.67 → 1710 unlocks Final Day Solo (+15,500)', () => {
    const bp = nextBreakpoint(seedRoster[0])!
    expect(bp.targetIlvl).toBe(1710)
    expect(bp.goldGain).toBe(15500)
    expect(bp.unlocks.map((r) => r.id)).toEqual(['final-day-solo'])
  })

  it('Vismunde at 1660 → 1670 for Act 2 Solo', () => {
    const bp = nextBreakpoint({ ilvl: 1660, learnedRaids: [] })!
    expect(bp.targetIlvl).toBe(1670)
    expect(bp.next.total).toBe(34400)
  })

  it('returns null when nothing above pays more', () => {
    expect(nextBreakpoint({ ilvl: 1710, learnedRaids: [] })).toBeNull()
  })
})

describe('rankBreakpoints', () => {
  it('matches the plan doc priorities: main → 1710, Miriya, then Vismunde before Miriyanah', () => {
    const ranked = rankBreakpoints(seedRoster).map((r) => r.character.id)
    expect(ranked).toEqual(['smokesensi', 'miriya', 'vismunde', 'miriyanah'])
  })
})

describe('honingEstimate', () => {
  it('10 item levels = 12 normal successes', () => {
    expect(honingEstimate(1660, 1670)).toMatchObject({ pieceLevels: 60, normalSuccesses: 12, advancedLevels: 60 })
  })
})
