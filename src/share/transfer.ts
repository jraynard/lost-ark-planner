import type { GameData } from '../data/schema'
import { dailyPeriodStart, weeklyPeriodStart } from '../engine/reset'
import type { Character } from '../engine/types'
import { doneKeys, useChecklist, type Cadence } from '../store/checklist'
import { useRoster } from '../store/roster'
import type { SharePayload, ShareTick, ShareTicks } from './codec'

const periods = (now: Date): Record<Cadence, string> => ({ weekly: weeklyPeriodStart(now), daily: dailyPeriodStart(now) })

/** Builds the payload for a share code from the current stores. */
export function buildSharePayload(characters: Character[], includeChecklist: boolean, now: Date): SharePayload {
  const payload: SharePayload = { characters: characters.map(({ id: _id, ...draft }) => draft) }
  if (!includeChecklist) return payload

  const index = new Map(characters.map((c, i) => [c.id, i]))
  const state = useChecklist.getState()
  const current = periods(now)
  const ticks = (cadence: Cadence): ShareTicks => ({
    period: current[cadence],
    ticks: [...doneKeys(state[cadence], current[cadence])].flatMap((key): ShareTick[] => {
      const [owner, id] = key.split(':')
      if (owner === 'roster') return [{ character: null, id }]
      const i = index.get(owner)
      return i === undefined ? [] : [{ character: i, id }]
    }),
  })
  return { ...payload, checklist: { weekly: ticks('weekly'), daily: ticks('daily') } }
}

/** Checklist ticks in the payload that still belong to the current reset periods. */
export function currentTickCount(payload: SharePayload, now: Date): number {
  if (!payload.checklist) return 0
  const current = periods(now)
  return (['weekly', 'daily'] as const).reduce(
    (n, cadence) => n + (payload.checklist![cadence].period === current[cadence] ? payload.checklist![cadence].ticks.length : 0),
    0,
  )
}

/** Writes a decoded share payload into the stores. */
export function applyImport(payload: SharePayload, mode: 'replace' | 'merge', now: Date, data: GameData) {
  const knownRaids = new Set(data.raids.map((r) => r.id))
  const drafts = payload.characters.map((c) => ({ ...c, learnedRaids: c.learnedRaids.filter((id) => knownRaids.has(id)) }))
  const ids = useRoster.getState().importCharacters(drafts, mode)

  if (!payload.checklist) return
  const current = periods(now)
  for (const cadence of ['weekly', 'daily'] as const) {
    const { period, ticks } = payload.checklist[cadence]
    if (period !== current[cadence]) continue
    const keys = ticks.map((t) => `${t.character === null ? 'roster' : ids[t.character]}:${t.id}`)
    useChecklist.getState().importTicks(cadence, period, keys)
  }
}
