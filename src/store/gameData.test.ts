import { beforeEach, describe, expect, it } from 'vitest'
import { bundledGameData } from '../data/game'
import { activeGameData, useGameDataStore } from './gameData'

const next = () => ({ ...structuredClone(bundledGameData), version: bundledGameData.version + 1 })
const store = () => useGameDataStore.getState()

beforeEach(() => {
  localStorage.clear()
  useGameDataStore.setState({ accepted: null, skippedVersion: null, lastChecked: null, pending: null, status: 'idle' })
})

describe('game data store', () => {
  it('holds a newer version as pending until accepted', async () => {
    const remote = next()
    await store().check(async () => remote)
    expect(store().pending?.version).toBe(remote.version)
    expect(activeGameData(store().accepted).version).toBe(bundledGameData.version)

    store().accept()
    expect(store().pending).toBeNull()
    expect(activeGameData(store().accepted).version).toBe(remote.version)
  })

  it('later asks again on the next check; skip does not', async () => {
    await store().check(async () => next())
    store().later()
    await store().check(async () => next())
    expect(store().pending).not.toBeNull()

    store().skip()
    await store().check(async () => next())
    expect(store().pending).toBeNull()
    expect(store().status).toBe('up-to-date')
  })

  it('reports fetch failures without changing data', async () => {
    await store().check(async () => {
      throw new Error('offline')
    })
    expect(store().status).toBe('error')
    expect(store().accepted).toBeNull()
  })

  it('prefers the bundled copy when it is newer than the accepted one', () => {
    expect(activeGameData({ ...bundledGameData, version: 0 })).toBe(bundledGameData)
  })
})
