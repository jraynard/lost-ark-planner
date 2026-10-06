import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate'
import { z } from 'zod'
import { GEAR_SLOTS, ilvlFromGear } from '../engine/ilvl'
import type { Character, CharacterRole, GearLevel, GearSlot } from '../engine/types'

/**
 * Share codes: `LAP1.` + base64url(deflate(compact JSON)). Short enough for SMS and a QR code.
 * Codes are untrusted input, so decoding caps sizes and validates everything.
 */
export const SHARE_PREFIX = 'LAP1.'
const MAX_CODE_LENGTH = 8000
const MAX_JSON_BYTES = 64 * 1024

const ROLES: CharacterRole[] = ['main', 'gold', 'alt', 'questing']

export type CharacterDraft = Omit<Character, 'id'>

/** A tick refers to a character by its position in `characters`; null = roster-wide task. */
export interface ShareTick {
  character: number | null
  id: string
}

export interface ShareTicks {
  period: string
  ticks: ShareTick[]
}

export interface SharePayload {
  characters: CharacterDraft[]
  checklist?: { weekly: ShareTicks; daily: ShareTicks }
}

// Compact wire format (v1).
const CompactTicks = z.tuple([z.string().max(40), z.array(z.tuple([z.number().int().min(-1).max(99), z.string().max(60)])).max(500)])
const CompactCharacter = z.tuple([
  z.string().min(1).max(40), // name
  z.string().max(40), // class
  z.number().int().min(0).max(ROLES.length - 1), // role
  z.union([z.literal(0), z.literal(1)]), // gold earner
  z.union([z.number().int().min(0).max(300000), z.array(z.number().int().min(0).max(40)).length(12)]), // ilvl×100 or gear
  z.array(z.string().max(60)).max(50), // learned raid ids
])
const Compact = z.object({
  c: z.array(CompactCharacter).min(1).max(30),
  k: z.object({ w: CompactTicks, d: CompactTicks }).optional(),
})
type Compact = z.infer<typeof Compact>

export function encodeShare(payload: SharePayload): string {
  const compact: Compact = {
    c: payload.characters.map((c) => [
      c.name,
      c.className,
      ROLES.indexOf(c.role),
      c.goldEarner ? 1 : 0,
      c.gear ? GEAR_SLOTS.flatMap((s) => [c.gear![s].normal, c.gear![s].advanced]) : Math.round(c.ilvl * 100),
      c.learnedRaids,
    ]),
  }
  if (payload.checklist) {
    const ticks = (t: ShareTicks): z.infer<typeof CompactTicks> => [t.period, t.ticks.map((k) => [k.character ?? -1, k.id])]
    compact.k = { w: ticks(payload.checklist.weekly), d: ticks(payload.checklist.daily) }
  }
  return SHARE_PREFIX + toBase64Url(deflateSync(strToU8(JSON.stringify(compact)), { level: 9 }))
}

export class ShareCodeError extends Error {}

/** Accepts a bare code, or a share link containing `d=<code>`. */
export function decodeShare(input: string): SharePayload {
  const code = extractCode(input)
  if (!code.startsWith(SHARE_PREFIX)) throw new ShareCodeError('That isn’t a Lost Ark Planner share code.')
  if (code.length > MAX_CODE_LENGTH) throw new ShareCodeError('That code is too long.')

  let json: string
  try {
    const inflated = inflateSync(fromBase64Url(code.slice(SHARE_PREFIX.length)))
    if (inflated.length > MAX_JSON_BYTES) throw new Error('too large')
    json = strFromU8(inflated)
  } catch {
    throw new ShareCodeError('The code is damaged or incomplete. Copy it again.')
  }

  let parsed: Compact
  try {
    parsed = Compact.parse(JSON.parse(json))
  } catch {
    throw new ShareCodeError('The code is damaged or from a newer app version.')
  }

  const characters = parsed.c.map(([name, className, role, goldEarner, level, learnedRaids]): CharacterDraft => {
    const base = { name, className, role: ROLES[role], goldEarner: goldEarner === 1, learnedRaids }
    if (!Array.isArray(level)) return { ...base, ilvl: level / 100 }
    const gear = toGear(level)
    return { ...base, ilvl: ilvlFromGear(gear), gear }
  })
  const ticks = ([period, list]: z.infer<typeof CompactTicks>): ShareTicks => ({
    period,
    ticks: list
      .filter(([i]) => i < characters.length)
      .map(([i, id]) => ({ character: i === -1 ? null : i, id })),
  })
  return {
    characters,
    ...(parsed.k && { checklist: { weekly: ticks(parsed.k.w), daily: ticks(parsed.k.d) } }),
  }
}

function extractCode(input: string): string {
  const trimmed = input.replace(/\s+/g, '')
  const fromLink = /[?&]d=([^&#]+)/.exec(trimmed)
  return fromLink ? decodeURIComponent(fromLink[1]) : trimmed
}

function toGear(flat: number[]): Record<GearSlot, GearLevel> {
  return Object.fromEntries(
    GEAR_SLOTS.map((slot, i) => [slot, { normal: Math.min(flat[i * 2], 25), advanced: flat[i * 2 + 1] }]),
  ) as Record<GearSlot, GearLevel>
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new Error('bad characters')
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}
