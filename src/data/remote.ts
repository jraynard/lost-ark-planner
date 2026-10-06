import { z } from 'zod'
import { raidLabel } from './game'
import { GameDataSchema, SUPPORTED_SCHEMA_VERSION, type GameData, type Raid } from './schema'

export const GAME_DATA_URL: string =
  import.meta.env.VITE_GAME_DATA_URL ??
  'https://raw.githubusercontent.com/jraynard/lost-ark-planner/main/data/game-data.json'

export type RemoteCheck =
  | { kind: 'invalid' }
  | { kind: 'current' }
  | { kind: 'skipped'; version: number }
  | { kind: 'needs-app-update'; version: number }
  | { kind: 'available'; data: GameData }

const Header = z.object({ schemaVersion: z.number().int(), version: z.number().int() })

/** Decide what to do with a fetched game data file. */
export function evaluateRemote(json: unknown, active: GameData, skippedVersion: number | null): RemoteCheck {
  const header = Header.safeParse(json)
  if (!header.success) return { kind: 'invalid' }
  const { schemaVersion, version } = header.data
  if (version <= active.version) return { kind: 'current' }
  if (version === skippedVersion) return { kind: 'skipped', version }
  if (schemaVersion > SUPPORTED_SCHEMA_VERSION) return { kind: 'needs-app-update', version }
  const parsed = GameDataSchema.safeParse(json)
  return parsed.success ? { kind: 'available', data: parsed.data } : { kind: 'invalid' }
}

export async function fetchRemoteGameData(url: string = GAME_DATA_URL): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Game data request failed: ${res.status}`)
  return res.json()
}

/** Human-readable list of what changed between two game data versions. */
export function diffGameData(from: GameData, to: GameData): string[] {
  const changes: string[] = []
  const before = new Map(from.raids.map((r) => [r.id, r]))
  const after = new Map(to.raids.map((r) => [r.id, r]))
  const fmt = (n: number | null) => (n === null ? 'unknown' : n.toLocaleString('en-US'))

  for (const raid of to.raids) {
    const old = before.get(raid.id)
    if (!old) {
      changes.push(`New raid: ${raidLabel(raid)} (${raid.minIlvl}, ${fmt(raid.gold)} gold)`)
      continue
    }
    const fields: [keyof Raid, string, (v: never) => string][] = [
      ['gold', 'gold', fmt],
      ['minIlvl', 'entry item level', String],
      ['goldType', 'gold binding', String],
    ]
    for (const [key, label, show] of fields) {
      if (old[key] !== raid[key]) {
        changes.push(`${raidLabel(raid)} ${label}: ${show(old[key] as never)} → ${show(raid[key] as never)}`)
      }
    }
  }
  for (const raid of from.raids) {
    if (!after.has(raid.id)) changes.push(`Removed raid: ${raidLabel(raid)}`)
  }

  const sections: [string, unknown, unknown][] = [
    ['Gold rules', from.goldRules, to.goldRules],
    ['Daily tasks', from.tasks, to.tasks],
    ['Event milestones', [from.eventMilestones, from.eventsEnd], [to.eventMilestones, to.eventsEnd]],
    ['Honing data', from.honing, to.honing],
    ['Default material prices', from.materialPrices, to.materialPrices],
  ]
  for (const [label, a, b] of sections) {
    if (JSON.stringify(a) !== JSON.stringify(b)) changes.push(`${label} updated`)
  }
  return changes
}
