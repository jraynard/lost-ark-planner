import { describe, expect, it } from 'vitest'
import raw from '../../data/game-data.json'
import { GameDataSchema, SUPPORTED_SCHEMA_VERSION } from './schema'

// Guards edits to data/game-data.json before they're pushed. Gold fixtures live in engine tests.
describe('data/game-data.json', () => {
  const data = GameDataSchema.parse(raw)

  it('uses a schema version this app can read', () => {
    expect(data.schemaVersion).toBeLessThanOrEqual(SUPPORTED_SCHEMA_VERSION)
  })

  it('has a changelog entry for the current version', () => {
    expect(data.changelog.map((c) => c.version)).toContain(data.version)
  })

  it('has unique raid and task ids', () => {
    const raidIds = data.raids.map((r) => r.id)
    const taskIds = data.tasks.map((t) => t.id)
    expect(new Set(raidIds).size).toBe(raidIds.length)
    expect(new Set(taskIds).size).toBe(taskIds.length)
  })

  it('has probabilities between 0 and 1', () => {
    const rates = [
      ...data.honing.normal.map((s) => s.baseRate ?? 0),
      ...data.honing.advanced.flatMap((b) => b.outcomes.map((o) => o.chance)),
      ...Object.values(data.honing.special.chanceByTargetLevel),
    ]
    for (const r of rates) expect(r).toBeGreaterThanOrEqual(0)
    for (const r of rates) expect(r).toBeLessThanOrEqual(1)
  })
})
