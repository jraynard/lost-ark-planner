import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Cadence = 'daily' | 'weekly'

interface PeriodTicks {
  /** Start of the reset period these ticks belong to (from engine/reset). */
  period: string
  done: string[]
}

interface ChecklistState {
  daily: PeriodTicks
  weekly: PeriodTicks
  toggle: (cadence: Cadence, period: string, key: string) => void
  /** Adds ticks for `period`, keeping any already made in that period. */
  importTicks: (cadence: Cadence, period: string, keys: string[]) => void
}

const empty: PeriodTicks = { period: '', done: [] }

/** Ticks from an earlier reset period count as not done. */
export function doneKeys(ticks: PeriodTicks, period: string): Set<string> {
  return new Set(ticks.period === period ? ticks.done : [])
}

export const useChecklist = create<ChecklistState>()(
  persist(
    (set) => ({
      daily: empty,
      weekly: empty,
      toggle: (cadence, period, key) =>
        set((s) => {
          const done = doneKeys(s[cadence], period)
          if (done.has(key)) done.delete(key)
          else done.add(key)
          return { [cadence]: { period, done: [...done] } }
        }),
      importTicks: (cadence, period, keys) =>
        set((s) => ({ [cadence]: { period, done: [...new Set([...doneKeys(s[cadence], period), ...keys])] } })),
    }),
    {
      name: 'lost-ark-planner/checklist',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ daily: s.daily, weekly: s.weekly }),
    },
  ),
)
