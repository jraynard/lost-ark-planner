import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { seedRoster } from '../data/seed-roster'
import { ilvlFromGear } from '../engine/ilvl'
import type { Character } from '../engine/types'

export type CharacterDraft = Omit<Character, 'id'>

interface RosterState {
  characters: Character[]
  add: (draft: CharacterDraft) => Character
  update: (id: string, draft: CharacterDraft) => void
  remove: (id: string) => void
  setGoldEarner: (id: string, goldEarner: boolean) => void
  loadExample: () => void
  clear: () => void
}

/** Gear, when entered, is the source of truth for item level. */
const normalize = (draft: CharacterDraft): CharacterDraft => ({
  ...draft,
  name: draft.name.trim(),
  className: draft.className.trim(),
  ilvl: draft.gear ? ilvlFromGear(draft.gear) : draft.ilvl,
})

export const useRoster = create<RosterState>()(
  persist(
    (set) => ({
      characters: [],
      add: (draft) => {
        const character = { ...normalize(draft), id: crypto.randomUUID() }
        set((s) => ({ characters: [...s.characters, character] }))
        return character
      },
      update: (id, draft) =>
        set((s) => ({
          characters: s.characters.map((c) => (c.id === id ? { ...normalize(draft), id } : c)),
        })),
      remove: (id) => set((s) => ({ characters: s.characters.filter((c) => c.id !== id) })),
      setGoldEarner: (id, goldEarner) =>
        set((s) => ({
          characters: s.characters.map((c) => (c.id === id ? { ...c, goldEarner } : c)),
        })),
      loadExample: () => set({ characters: seedRoster.map((c) => ({ ...c })) }),
      clear: () => set({ characters: [] }),
    }),
    {
      name: 'lost-ark-planner/roster',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ characters: s.characters }),
    },
  ),
)
