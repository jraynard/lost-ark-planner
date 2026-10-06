import type { GameData } from '../data/schema'
import { activeGameData, useGameDataStore } from '../store/gameData'

/** The game data pages should plan with. */
export function useGameData(): GameData {
  return activeGameData(useGameDataStore((s) => s.accepted))
}
