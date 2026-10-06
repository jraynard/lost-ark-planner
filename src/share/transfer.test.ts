import { beforeEach, describe, expect, it } from 'vitest'
import { bundledGameData } from '../data/game'
import { dailyPeriodStart, weeklyPeriodStart } from '../engine/reset'
import { useChecklist } from '../store/checklist'
import { useRoster } from '../store/roster'
import { decodeShare, encodeShare } from './codec'
import { applyImport, buildSharePayload, currentTickCount } from './transfer'

const now = new Date('2026-10-06T12:00:00Z')
const week = weeklyPeriodStart(now)
const day = dailyPeriodStart(now)

beforeEach(() => {
  localStorage.clear()
  useRoster.getState().loadExample()
  useChecklist.setState({ daily: { period: '', done: [] }, weekly: { period: '', done: [] } })
})

describe('share transfer', () => {
  it('moves roster and this period’s ticks to a fresh device', () => {
    const chars = useRoster.getState().characters
    useChecklist.getState().toggle('weekly', week, `${chars[0].id}:act4-solo`)
    useChecklist.getState().toggle('daily', day, 'roster:chaos-gate')
    const code = encodeShare(buildSharePayload(chars, true, now))

    // "Other device": empty stores.
    useRoster.getState().clear()
    useChecklist.setState({ daily: { period: '', done: [] }, weekly: { period: '', done: [] } })

    const payload = decodeShare(code)
    expect(currentTickCount(payload, now)).toBe(2)
    applyImport(payload, 'replace', now, bundledGameData)

    const imported = useRoster.getState().characters
    expect(imported.map((c) => c.name)).toEqual(chars.map((c) => c.name))
    expect(useChecklist.getState().weekly.done).toEqual([`${imported[0].id}:act4-solo`])
    expect(useChecklist.getState().daily.done).toEqual(['roster:chaos-gate'])
  })

  it('drops ticks from an earlier reset period', () => {
    const payload = decodeShare(encodeShare(buildSharePayload(useRoster.getState().characters, true, now)))
    payload.checklist!.weekly = { period: '2026-09-23T10:00:00.000Z', ticks: [{ character: 0, id: 'act4-solo' }] }
    expect(currentTickCount(payload, now)).toBe(0)
    applyImport(payload, 'replace', now, bundledGameData)
    expect(useChecklist.getState().weekly.done).toEqual([])
  })

  it('merge updates same-name characters and keeps the rest', () => {
    const before = useRoster.getState().characters
    const smokesensi = before.find((c) => c.name === 'Smokesensi')!
    applyImport(
      { characters: [{ ...smokesensi, name: 'smokesensi', ilvl: 1710, gear: undefined }, { ...smokesensi, name: 'Newchar', gear: undefined, ilvl: 1600 }] },
      'merge',
      now,
      bundledGameData,
    )
    const after = useRoster.getState().characters
    expect(after).toHaveLength(7)
    expect(after.find((c) => c.id === smokesensi.id)?.ilvl).toBe(1710)
  })

  it('drops learned raids this game data doesn’t know', () => {
    const [first] = useRoster.getState().characters
    applyImport({ characters: [{ ...first, learnedRaids: ['horizon-1', 'future-raid'] }] }, 'replace', now, bundledGameData)
    expect(useRoster.getState().characters[0].learnedRaids).toEqual(['horizon-1'])
  })
})
