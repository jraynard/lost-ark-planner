import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { bundledGameData } from '../data/game'
import { evaluateRemote, fetchRemoteGameData } from '../data/remote'
import { GameDataSchema, type GameData } from '../data/schema'

export type CheckStatus = 'idle' | 'checking' | 'up-to-date' | 'error' | 'needs-app-update'

interface GameDataState {
  /** Remote copy the user accepted; ignored when the bundled copy is newer. */
  accepted: GameData | null
  skippedVersion: number | null
  lastChecked: string | null
  /** A newer version waiting for the user's answer (not persisted: re-checked each start). */
  pending: GameData | null
  status: CheckStatus
  check: (fetcher?: () => Promise<unknown>) => Promise<void>
  accept: () => void
  later: () => void
  skip: () => void
}

/** The game data to plan with: the newer of the accepted remote copy and the bundled copy. */
export function activeGameData(accepted: GameData | null): GameData {
  return accepted && accepted.version > bundledGameData.version ? accepted : bundledGameData
}

export const useGameDataStore = create<GameDataState>()(
  persist(
    (set, get) => ({
      accepted: null,
      skippedVersion: null,
      lastChecked: null,
      pending: null,
      status: 'idle',
      check: async (fetcher = fetchRemoteGameData) => {
        if (get().status === 'checking') return
        set({ status: 'checking' })
        try {
          const json = await fetcher()
          const result = evaluateRemote(json, activeGameData(get().accepted), get().skippedVersion)
          set({
            lastChecked: new Date().toISOString(),
            pending: result.kind === 'available' ? result.data : null,
            status:
              result.kind === 'needs-app-update' ? 'needs-app-update' : result.kind === 'invalid' ? 'error' : 'up-to-date',
          })
        } catch {
          set({ status: 'error', lastChecked: new Date().toISOString() })
        }
      },
      accept: () => {
        const { pending } = get()
        if (pending) set({ accepted: pending, pending: null, skippedVersion: null })
      },
      later: () => set({ pending: null }),
      skip: () => {
        const { pending } = get()
        if (pending) set({ skippedVersion: pending.version, pending: null })
      },
    }),
    {
      name: 'lost-ark-planner/game-data',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ accepted: s.accepted, skippedVersion: s.skippedVersion, lastChecked: s.lastChecked }),
      // A stored copy that no longer matches the schema (e.g. after an app update) is dropped.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameDataState>
        const accepted = GameDataSchema.safeParse(p.accepted).success ? (p.accepted as GameData) : null
        return { ...current, ...p, accepted }
      },
    },
  ),
)
