import rawGameData from '../../data/game-data.json'
import { GameDataSchema, type GameData, type Raid } from './schema'

/**
 * Game data shipped with the app (data/game-data.json). Used until the user accepts a newer
 * published version, and as the fallback when offline. Validated here so a bad edit fails fast.
 */
export const bundledGameData: GameData = GameDataSchema.parse(rawGameData)

export function raidLabel(raid: Raid): string {
  if (raid.family === 'horizon' || raid.family === 'behemoth') return raid.name
  const mode = raid.mode === 'matchmaking' ? 'Matchmaking' : raid.mode[0].toUpperCase() + raid.mode.slice(1)
  return `${raid.name} ${mode}`
}
