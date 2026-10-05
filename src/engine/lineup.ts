import { goldRules, raids as allRaids, type GoldType, type Raid } from '../data/raids'
import type { Character } from './types'

export interface GoldBreakdown {
  tradable: number
  roster: number
  character: number
}

export interface Lineup {
  raids: Raid[]
  /** Known gold only; see `hasUnknownGold`. */
  total: number
  breakdown: GoldBreakdown
  /** A picked raid has gold: null, so the real total is higher than `total`. */
  hasUnknownGold: boolean
}

type LineupInput = Pick<Character, 'ilvl' | 'learnedRaids'>

/** Raids the character can enter and is willing to run: solo modes, plus learned group content. */
export function eligibleRaids(char: LineupInput, raids: Raid[] = allRaids): Raid[] {
  return raids.filter(
    (r) => r.minIlvl <= char.ilvl && (!r.groupOnly || char.learnedRaids.includes(r.id)),
  )
}

/** Unknown gold sorts after any known amount, so it only fills otherwise empty slots. */
const goldRank = (r: Raid) => r.gold ?? -1

/** Best gold-earning raids for the week: highest gold first, one claim per raid family. */
export function bestLineup(char: LineupInput, raids: Raid[] = allRaids): Lineup {
  const sorted = eligibleRaids(char, raids).sort((a, b) => goldRank(b) - goldRank(a))
  const picked: Raid[] = []
  const families = new Set<string>()
  for (const raid of sorted) {
    if (picked.length === goldRules.raidsPerCharacter) break
    if (families.has(raid.family)) continue
    families.add(raid.family)
    picked.push(raid)
  }
  return summarize(picked)
}

export function summarize(picked: Raid[]): Lineup {
  const breakdown: GoldBreakdown = { tradable: 0, roster: 0, character: 0 }
  for (const raid of picked) addGold(breakdown, raid.gold ?? 0, raid.goldType)
  return {
    raids: picked,
    total: breakdown.tradable + breakdown.roster + breakdown.character,
    breakdown,
    hasUnknownGold: picked.some((r) => r.gold === null),
  }
}

function addGold(b: GoldBreakdown, gold: number, type: GoldType) {
  if (type === 'split') {
    b.tradable += gold / 2
    b.roster += gold / 2
  } else {
    b[type] += gold
  }
}

export interface RosterSummary {
  lineups: { character: Character; lineup: Lineup }[]
  total: number
  breakdown: GoldBreakdown
  goldEarnerCount: number
  overCap: boolean
}

export function rosterSummary(roster: Character[], raids: Raid[] = allRaids): RosterSummary {
  const earners = roster.filter((c) => c.goldEarner)
  const lineups = earners.map((character) => ({ character, lineup: bestLineup(character, raids) }))
  const breakdown: GoldBreakdown = { tradable: 0, roster: 0, character: 0 }
  for (const { lineup } of lineups) {
    breakdown.tradable += lineup.breakdown.tradable
    breakdown.roster += lineup.breakdown.roster
    breakdown.character += lineup.breakdown.character
  }
  return {
    lineups,
    total: breakdown.tradable + breakdown.roster + breakdown.character,
    breakdown,
    goldEarnerCount: earners.length,
    overCap: earners.length > goldRules.goldEarnersPerRoster,
  }
}
