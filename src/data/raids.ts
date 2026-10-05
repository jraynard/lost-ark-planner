/**
 * Raid gold table. Source: docs/progression-plan.md (Sep 16, 2026 patch for Act 4,
 * Final Day and Serca; Jun 10, 2026 patch for the rest).
 *
 * Solo modes pay the same gold as Normal. Checked in game on 2026-10-05 (docs/in-game-checks.md);
 * `verified: false` marks values not yet confirmed there.
 */

/** split = half tradable, half roster-bound */
export type GoldType = 'tradable' | 'split' | 'roster' | 'character'
export type RaidMode = 'solo' | 'normal' | 'hard' | 'matchmaking'

export interface Raid {
  id: string
  /** Raids in the same family share one gold claim per week, whatever the mode. */
  family: string
  name: string
  mode: RaidMode
  minIlvl: number
  /** null = unknown; check in game. */
  gold: number | null
  goldType: GoldType
  /** Needs a party; only planned once the player marks it as learned. */
  groupOnly: boolean
  patch: string
  verified: boolean
}

const SEP = '2026-09-16'
const JUN = '2026-06-10'

export const raids: Raid[] = [
  { id: 'echidna-solo', family: 'echidna', name: 'Echidna', mode: 'solo', minIlvl: 1620, gold: 6100, goldType: 'roster', groupOnly: false, patch: JUN, verified: true },
  { id: 'echidna-normal', family: 'echidna', name: 'Echidna', mode: 'normal', minIlvl: 1620, gold: 6100, goldType: 'roster', groupOnly: true, patch: JUN, verified: true },
  { id: 'echidna-hard', family: 'echidna', name: 'Echidna', mode: 'hard', minIlvl: 1630, gold: 7200, goldType: 'split', groupOnly: true, patch: JUN, verified: true },

  { id: 'behemoth-normal', family: 'behemoth', name: 'Behemoth', mode: 'normal', minIlvl: 1620, gold: 7200, goldType: 'split', groupOnly: true, patch: JUN, verified: true },

  { id: 'thaemine-solo', family: 'thaemine', name: 'Thaemine', mode: 'solo', minIlvl: 1610, gold: 6400, goldType: 'roster', groupOnly: false, patch: SEP, verified: true },

  { id: 'aegir-solo', family: 'aegir', name: 'Aegir', mode: 'solo', minIlvl: 1660, gold: 11500, goldType: 'split', groupOnly: false, patch: JUN, verified: true },
  { id: 'aegir-normal', family: 'aegir', name: 'Aegir', mode: 'normal', minIlvl: 1660, gold: 11500, goldType: 'split', groupOnly: true, patch: JUN, verified: true },
  { id: 'aegir-hard', family: 'aegir', name: 'Aegir', mode: 'hard', minIlvl: 1680, gold: 18000, goldType: 'split', groupOnly: true, patch: JUN, verified: true },

  { id: 'act2-solo', family: 'act2', name: 'Act 2', mode: 'solo', minIlvl: 1670, gold: 16500, goldType: 'split', groupOnly: false, patch: JUN, verified: true },
  { id: 'act2-normal', family: 'act2', name: 'Act 2', mode: 'normal', minIlvl: 1670, gold: 16500, goldType: 'split', groupOnly: true, patch: JUN, verified: true },
  { id: 'act2-hard', family: 'act2', name: 'Act 2', mode: 'hard', minIlvl: 1690, gold: 23000, goldType: 'split', groupOnly: true, patch: JUN, verified: true },

  { id: 'act3-solo', family: 'act3', name: 'Act 3', mode: 'solo', minIlvl: 1680, gold: 21000, goldType: 'split', groupOnly: false, patch: JUN, verified: true },
  { id: 'act3-normal', family: 'act3', name: 'Act 3', mode: 'normal', minIlvl: 1680, gold: 21000, goldType: 'split', groupOnly: true, patch: JUN, verified: true },
  { id: 'act3-hard', family: 'act3', name: 'Act 3', mode: 'hard', minIlvl: 1700, gold: 27000, goldType: 'split', groupOnly: true, patch: JUN, verified: true },

  { id: 'act4-solo', family: 'act4', name: 'Act 4', mode: 'solo', minIlvl: 1700, gold: 27000, goldType: 'split', groupOnly: false, patch: SEP, verified: true },
  { id: 'act4-normal', family: 'act4', name: 'Act 4', mode: 'normal', minIlvl: 1700, gold: 27000, goldType: 'split', groupOnly: true, patch: SEP, verified: true },
  { id: 'act4-hard', family: 'act4', name: 'Act 4', mode: 'hard', minIlvl: 1720, gold: 38000, goldType: 'tradable', groupOnly: true, patch: SEP, verified: true },

  { id: 'horizon-1', family: 'horizon', name: 'Horizon Cathedral Stage 1', mode: 'normal', minIlvl: 1700, gold: 30000, goldType: 'character', groupOnly: true, patch: JUN, verified: true },
  { id: 'horizon-2', family: 'horizon', name: 'Horizon Cathedral Stage 2', mode: 'normal', minIlvl: 1720, gold: 40000, goldType: 'character', groupOnly: true, patch: JUN, verified: false },

  { id: 'final-day-solo', family: 'final-day', name: 'Final Day', mode: 'solo', minIlvl: 1710, gold: 32000, goldType: 'split', groupOnly: false, patch: SEP, verified: true },
  { id: 'final-day-normal', family: 'final-day', name: 'Final Day', mode: 'normal', minIlvl: 1710, gold: 32000, goldType: 'split', groupOnly: true, patch: SEP, verified: true },
  { id: 'final-day-hard', family: 'final-day', name: 'Final Day', mode: 'hard', minIlvl: 1730, gold: 48000, goldType: 'tradable', groupOnly: true, patch: SEP, verified: true },

  { id: 'serca-matchmaking', family: 'serca', name: 'Serca', mode: 'matchmaking', minIlvl: 1710, gold: 32000, goldType: 'split', groupOnly: true, patch: SEP, verified: true },
]

export const raidsById: Record<string, Raid> = Object.fromEntries(raids.map((r) => [r.id, r]))

/** Gold rules; see docs/in-game-checks.md "Gold rules". */
export const goldRules = {
  raidsPerCharacter: 3,
  goldEarnersPerRoster: 6,
}

export function raidLabel(raid: Raid): string {
  if (raid.family === 'horizon' || raid.family === 'behemoth') return raid.name
  const mode = raid.mode === 'matchmaking' ? 'Matchmaking' : raid.mode[0].toUpperCase() + raid.mode.slice(1)
  return `${raid.name} ${mode}`
}
