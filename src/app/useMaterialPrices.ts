import type { MaterialPrices } from '../engine/honing-cost'
import { useSettings } from '../store/settings'
import { useGameData } from './useGameData'

/** Game data default prices, overridden by the user's own. */
export function useMaterialPrices(): MaterialPrices {
  const defaults = useGameData().materialPrices
  const own = useSettings((s) => s.materialPrices)
  return { ...defaults, ...own }
}
