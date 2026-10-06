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
  addLearnedRaid: (id: string, raidId: string) => void
  loadExample: () => void
  /**
   * Adds characters from a share code. `replace` drops the current roster; `merge` updates
   * characters with the same name and adds the rest. Returns the ids in draft order.
   */
  importCharacters: (drafts: CharacterDraft[], mode: 'replace' | 'merge') => string[]
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
    (set, get) => ({
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
      addLearnedRaid: (id, raidId) =>
        set((s) => ({
          characters: s.characters.map((c) =>
            c.id === id && !c.learnedRaids.includes(raidId) ? { ...c, learnedRaids: [...c.learnedRaids, raidId] } : c,
          ),
        })),
      loadExample: () => set({ characters: seedRoster.map((c) => ({ ...c })) }),
      importCharacters: (drafts, mode) => {
        const existing = mode === 'merge' ? [...get().characters] : []
        const ids = drafts.map((draft) => {
          const match = existing.findIndex((c) => c.name.toLowerCase() === draft.name.trim().toLowerCase())
          if (match >= 0) {
            existing[match] = { ...normalize(draft), id: existing[match].id }
            return existing[match].id
          }
          const character = { ...normalize(draft), id: crypto.randomUUID() }
          existing.push(character)
          return character.id
        })
        set({ characters: existing })
        return ids
      },
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
