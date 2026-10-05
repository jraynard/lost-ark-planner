import { ilvlFromGear, uniformGear } from '../engine/ilvl'
import type { Character, GearLevel, GearSlot } from '../engine/types'

const gear = (
  helmet: [number, number], shoulders: [number, number], chest: [number, number],
  pants: [number, number], gloves: [number, number], weapon: [number, number],
): Record<GearSlot, GearLevel> => {
  const g = { helmet, shoulders, chest, pants, gloves, weapon }
  return Object.fromEntries(
    Object.entries(g).map(([slot, [normal, advanced]]) => [slot, { normal, advanced }]),
  ) as Record<GearSlot, GearLevel>
}

const withIlvl = (c: Omit<Character, 'ilvl'> & { ilvl?: number }): Character => ({
  ...c,
  ilvl: c.gear ? ilvlFromGear(c.gear) : (c.ilvl ?? 0),
})

/** Example roster, from docs/progression-plan.md and docs/in-game-checks.md (2026-10-05). */
export const seedRoster: Character[] = [
  withIlvl({ id: 'smokesensi', name: 'Smokesensi', className: 'Shadowhunter', role: 'main', goldEarner: true, learnedRaids: [],
    gear: gear([18, 20], [18, 20], [18, 20], [18, 30], [18, 30], [19, 29]) }),
  withIlvl({ id: 'miriya', name: 'Miriya', className: 'Arcanist', role: 'gold', goldEarner: true, learnedRaids: [],
    gear: gear([18, 20], [18, 20], [18, 23], [18, 20], [18, 20], [18, 25]) }),
  withIlvl({ id: 'vismunde', name: 'Vismunde', className: 'Dimensionalist', role: 'alt', goldEarner: true, learnedRaids: [],
    gear: uniformGear(10, 20) }),
  withIlvl({ id: 'miriyanah', name: 'Miriyanah', className: 'Guardianknight', role: 'alt', goldEarner: true, learnedRaids: [],
    gear: uniformGear(10, 0) }),
  withIlvl({ id: 'cygnus', name: 'Cygnus', className: 'Machinist', ilvl: 1475, role: 'questing', goldEarner: false, learnedRaids: [] }),
  withIlvl({ id: 'vedinah', name: 'Vedinah', className: 'Valkyrie', ilvl: 1475, role: 'questing', goldEarner: false, learnedRaids: [] }),
]
