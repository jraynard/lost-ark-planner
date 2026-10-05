export type GearSlot = 'helmet' | 'shoulders' | 'chest' | 'pants' | 'gloves' | 'weapon'

export interface GearLevel {
  normal: number
  advanced: number
}

export type CharacterRole = 'main' | 'gold' | 'alt' | 'questing'

export interface Character {
  id: string
  name: string
  className: string
  ilvl: number
  role: CharacterRole
  /** Counts toward the roster's gold-earner cap and gets raid gold. */
  goldEarner: boolean
  /** Ids of group-only raids the player is willing to run on this character. */
  learnedRaids: string[]
  /** Per-piece honing levels, when known. */
  gear?: Record<GearSlot, GearLevel>
}
