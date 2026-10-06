import { bundledGameData } from '../data/game'
import type { GameData, GoldType, Raid } from '../data/schema'
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
export function eligibleRaids(char: LineupInput, data: GameData = bundledGameData): Raid[] {
  return data.raids.filter(
    (r) => r.minIlvl <= char.ilvl && (!r.groupOnly || char.learnedRaids.includes(r.id)),
  )
}

/** Unknown gold sorts after any known amount, so it only fills otherwise empty slots. */
const goldRank = (r: Raid) => r.gold ?? -1

/** Best gold-earning raids for the week: highest gold first, one claim per raid family. */
export function bestLineup(char: LineupInput, data: GameData = bundledGameData): Lineup {
  const sorted = eligibleRaids(char, data).sort((a, b) => goldRank(b) - goldRank(a))
  const picked: Raid[] = []
  const families = new Set<string>()
  for (const raid of sorted) {
    if (picked.length === data.goldRules.raidsPerCharacter) break
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

export function rosterSummary(roster: Character[], data: GameData = bundledGameData): RosterSummary {
  const earners = roster.filter((c) => c.goldEarner)
  const lineups = earners.map((character) => ({ character, lineup: bestLineup(character, data) }))
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
    overCap: earners.length > data.goldRules.goldEarnersPerRoster,
  }
}

export interface GroupUpgrade {
  raid: Raid
  /** Weekly gold gained by adding this raid to the character's learned content. */
  gain: number
}

/** Group raids the character can enter but hasn't marked as learned, that would raise weekly gold. */
export function groupUpgrades(char: LineupInput, data: GameData = bundledGameData): GroupUpgrade[] {
  const current = bestLineup(char, data).total
  return data.raids
    .filter((r) => r.groupOnly && r.minIlvl <= char.ilvl && !char.learnedRaids.includes(r.id))
    .map((raid) => ({
      raid,
      gain: bestLineup({ ...char, learnedRaids: [...char.learnedRaids, raid.id] }, data).total - current,
    }))
    .filter((u) => u.gain > 0)
    .sort((a, b) => b.gain - a.gain)
}
