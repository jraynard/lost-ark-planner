/** Gear pieces whose honing levels average into item level. */
export const GEAR_PIECES = 6
/** Item levels a single normal honing success adds to its piece. */
export const PIECE_ILVL_PER_NORMAL = 5
/** Advanced honing levels that equal one normal level. */
export const ADVANCED_PER_NORMAL = 5

export interface HoningEstimate {
  ilvlGain: number
  /** Sum of piece item levels needed across all six pieces. */
  pieceLevels: number
  normalSuccesses: number
  /** Same distance expressed as advanced honing levels instead. */
  advancedLevels: number
}

/**
 * Rule-of-thumb distance between two item levels:
 * 10 item levels = 60 piece levels = 12 normal successes.
 */
export function honingEstimate(from: number, to: number): HoningEstimate {
  const ilvlGain = Math.max(0, to - from)
  const pieceLevels = ilvlGain * GEAR_PIECES
  return {
    ilvlGain,
    pieceLevels,
    normalSuccesses: Math.ceil(pieceLevels / PIECE_ILVL_PER_NORMAL - 1e-9),
    advancedLevels: Math.ceil(pieceLevels - 1e-9),
  }
}
