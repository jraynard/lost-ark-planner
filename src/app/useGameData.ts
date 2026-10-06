import { bundledGameData } from '../data/game'
import type { GameData } from '../data/schema'

/** The game data pages should plan with. */
export function useGameData(): GameData {
  return bundledGameData
}
