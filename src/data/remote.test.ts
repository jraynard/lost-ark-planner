import { describe, expect, it } from 'vitest'
import { bundledGameData } from './game'
import { diffGameData, evaluateRemote } from './remote'
import type { GameData } from './schema'

const bump = (patch: Partial<GameData> = {}): GameData => ({
  ...structuredClone(bundledGameData),
  version: bundledGameData.version + 1,
  ...patch,
})

describe('evaluateRemote', () => {
  it('offers a valid higher version', () => {
    const next = bump()
    expect(evaluateRemote(next, bundledGameData, null)).toEqual({ kind: 'available', data: next })
  })

  it('ignores the same or a lower version', () => {
    expect(evaluateRemote(bundledGameData, bundledGameData, null).kind).toBe('current')
    expect(evaluateRemote({ ...bundledGameData, version: 0 }, bundledGameData, null).kind).toBe('current')
  })

  it('respects a skipped version', () => {
    const next = bump()
    expect(evaluateRemote(next, bundledGameData, next.version)).toEqual({ kind: 'skipped', version: next.version })
  })

  it('flags a newer schema as needing an app update', () => {
    expect(evaluateRemote(bump({ schemaVersion: 99 }), bundledGameData, null).kind).toBe('needs-app-update')
  })

  it('rejects invalid files', () => {
    expect(evaluateRemote('<html>404</html>', bundledGameData, null).kind).toBe('invalid')
    expect(evaluateRemote({ ...bump(), raids: [{ id: 'x' }] }, bundledGameData, null).kind).toBe('invalid')
  })
})

describe('diffGameData', () => {
  it('lists raid gold, ilvl and section changes', () => {
    const next = bump()
    const act4 = next.raids.find((r) => r.id === 'act4-solo')!
    act4.gold = 25000
    act4.minIlvl = 1705
    next.honing.special.stonesPerAttempt.armor = 25
    expect(diffGameData(bundledGameData, next)).toEqual([
      'Act 4 Solo gold: 27,000 → 25,000',
      'Act 4 Solo entry item level: 1700 → 1705',
      'Honing data updated',
    ])
  })

  it('lists added and removed raids', () => {
    const next = bump()
    const removed = next.raids.pop()!
    next.raids.push({ ...removed, id: 'new-raid', name: 'Brelshaza', mode: 'solo', gold: 40000 })
    const diff = diffGameData(bundledGameData, next)
    expect(diff).toContain('New raid: Brelshaza Solo (1710, 40,000 gold)')
    expect(diff).toContain(`Removed raid: Serca Matchmaking`)
  })
})
