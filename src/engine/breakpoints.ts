import { raids as allRaids, type Raid } from '../data/raids'
import { honingEstimate, type HoningEstimate } from './honing'
import { bestLineup, type Lineup } from './lineup'
import type { Character } from './types'

export interface Breakpoint {
  targetIlvl: number
  current: Lineup
  next: Lineup
  /** Raids in the new lineup that the current one doesn't have. */
  unlocks: Raid[]
  goldGain: number
  goldPerIlvl: number
  honing: HoningEstimate
}

type BreakpointInput = Pick<Character, 'ilvl' | 'learnedRaids'>

/** The nearest item level above the character's where weekly raid gold goes up. */
export function nextBreakpoint(char: BreakpointInput, raids: Raid[] = allRaids): Breakpoint | null {
  const current = bestLineup(char, raids)
  const thresholds = [...new Set(raids.map((r) => r.minIlvl))]
    .filter((ilvl) => ilvl > char.ilvl)
    .sort((a, b) => a - b)

  for (const targetIlvl of thresholds) {
    const next = bestLineup({ ...char, ilvl: targetIlvl }, raids)
    const goldGain = next.total - current.total
    if (goldGain <= 0) continue
    const currentIds = new Set(current.raids.map((r) => r.id))
    return {
      targetIlvl,
      current,
      next,
      unlocks: next.raids.filter((r) => !currentIds.has(r.id)),
      goldGain,
      goldPerIlvl: goldGain / (targetIlvl - char.ilvl),
      honing: honingEstimate(char.ilvl, targetIlvl),
    }
  }
  return null
}

export interface RankedBreakpoint {
  character: Character
  breakpoint: Breakpoint
}

/** Gold earners' next breakpoints, best weekly gold per item level first. */
export function rankBreakpoints(roster: Character[], raids: Raid[] = allRaids): RankedBreakpoint[] {
  return roster
    .filter((c) => c.goldEarner)
    .flatMap((character) => {
      const breakpoint = nextBreakpoint(character, raids)
      return breakpoint ? [{ character, breakpoint }] : []
    })
    .sort((a, b) => b.breakpoint.goldPerIlvl - a.breakpoint.goldPerIlvl)
}

/** Upcoming event milestones above the character's item level. */
export function upcomingMilestones(ilvl: number, milestones: number[]): number[] {
  return milestones.filter((m) => m > ilvl).sort((a, b) => a - b)
}
