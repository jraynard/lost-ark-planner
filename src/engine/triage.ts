export type DropKind = 'accessory' | 'bracelet' | 'ability-stone' | 'other'
export type DropGrade = 'relic' | 'ancient' | 'other'
export type Verdict = 'keep' | 'sell' | 'dismantle' | 'check'

export interface Drop {
  kind: DropKind
  grade: DropGrade
  /** Accessories only. */
  quality?: number
  /** Accessory has support (ally buff) effects. */
  supportEffects?: boolean
  /** Ability stone is still uncut. */
  uncut?: boolean
}

export interface TriageResult {
  verdict: Verdict
  /** First thing to do, in plain words. */
  action: string
  reason: string
}

const AH_CHECK = 'Check its Auction House price first (your pet gives remote access).'

/** Keep/sell/dismantle rules from the progression plan's "Keep, sell or dismantle" table. */
export function triage(drop: Drop): TriageResult {
  if (drop.kind === 'accessory') {
    if (drop.supportEffects) {
      return {
        verdict: 'keep',
        action: 'Keep good ones for your support; sell the rest.',
        reason: 'Support accessories are wanted by support players and sell well.',
      }
    }
    if ((drop.quality ?? 0) < 67) {
      return { verdict: 'dismantle', action: 'Dismantle.', reason: 'Below 67 quality rarely sells.' }
    }
    if (drop.grade === 'ancient') {
      return {
        verdict: 'check',
        action: 'Equip it if it beats what you wear, otherwise sell.',
        reason: `${AH_CHECK} Accessories can only be traded 3 times.`,
      }
    }
    if (drop.grade === 'relic') {
      return {
        verdict: 'keep',
        action: 'Send to an alt that needs Enlightenment points; sell if none do.',
        reason: 'Relic pieces fill Ark Passive Enlightenment on alts cheaply.',
      }
    }
  }
  if (drop.kind === 'bracelet' && drop.grade === 'ancient') {
    return {
      verdict: 'check',
      action: 'Check the Auction House before dismantling. Don’t reroll one you might sell.',
      reason: 'Rerolling binds the bracelet.',
    }
  }
  if (drop.kind === 'ability-stone' && drop.uncut && drop.grade !== 'other') {
    return {
      verdict: 'check',
      action: 'Check the Auction House before faceting.',
      reason: 'A faceted stone usually can’t be sold.',
    }
  }
  return { verdict: 'dismantle', action: 'Dismantle.', reason: 'Nothing on this drop is worth keeping.' }
}
