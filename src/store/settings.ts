import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { MaterialId } from '../data/schema'

interface SettingsState {
  /** The user's own material prices; unset ones fall back to the game data defaults. */
  materialPrices: Partial<Record<MaterialId, number>>
  setMaterialPrice: (id: MaterialId, price: number | null) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      materialPrices: {},
      setMaterialPrice: (id, price) =>
        set((s) => {
          const materialPrices = { ...s.materialPrices }
          if (price === null || !Number.isFinite(price) || price < 0) delete materialPrices[id]
          else materialPrices[id] = price
          return { materialPrices }
        }),
    }),
    {
      name: 'lost-ark-planner/settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ materialPrices: s.materialPrices }),
    },
  ),
)
