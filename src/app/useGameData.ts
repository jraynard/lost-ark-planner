import { bundledGameData } from '../data/game'
import type { GameData } from '../data/schema'

/** The game data pages plan with. It ships with each build; new data arrives as a new deploy. */
export function useGameData(): GameData {
  return bundledGameData
}
