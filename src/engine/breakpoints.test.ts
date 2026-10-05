import { describe, expect, it } from 'vitest'
import { seedRoster } from '../data/seed-roster'
import { breakpointLadder, nextBreakpoint, rankBreakpoints } from './breakpoints'
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

describe('breakpointLadder', () => {
  it('1660 alt climbs 1670 → 1680 → 1700 → 1710', () => {
    const ladder = breakpointLadder({ ilvl: 1660, learnedRaids: [] })
    expect(ladder.map((b) => [b.targetIlvl, b.next.total])).toEqual([
      [1670, 34400],
      [1680, 49000],
      [1700, 64500],
      [1710, 80000],
    ])
    // Cumulative: 1660 → 1700 is 40 item levels = 48 normal successes.
    expect(ladder[2].honing.normalSuccesses).toBe(48)
  })

  it('main at 1705.67 needs exactly 26 piece levels for 1710', () => {
    const [step] = breakpointLadder(seedRoster[0])
    expect(step.honing.pieceLevels).toBeCloseTo(26)
    expect(step.honing.advancedLevels).toBe(26)
  })
})
