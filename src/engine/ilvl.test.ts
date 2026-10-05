import { describe, expect, it } from 'vitest'
import { seedRoster } from '../data/seed-roster'
import { formatIlvl, ilvlFromGear } from './ilvl'

// In-game item levels from docs/in-game-checks.md.
describe('ilvlFromGear', () => {
  it.each([
    ['smokesensi', '1705.66'],
    ['miriya', '1701.33'],
    ['vismunde', '1660.00'],
    ['miriyanah', '1640.00'],
  ])('%s shows %s', (id, expected) => {
    const char = seedRoster.find((c) => c.id === id)!
    expect(formatIlvl(ilvlFromGear(char.gear!))).toBe(expected)
  })
})
