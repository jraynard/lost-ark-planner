import { z } from 'zod'

/** Highest `schemaVersion` of data/game-data.json this app can read. */
export const SUPPORTED_SCHEMA_VERSION = 1

/** split = half tradable, half roster-bound */
export const GoldTypeSchema = z.enum(['tradable', 'split', 'roster', 'character'])
export const RaidModeSchema = z.enum(['solo', 'normal', 'hard', 'matchmaking'])
export const PieceTypeSchema = z.enum(['armor', 'weapon'])

export const RaidSchema = z.object({
  id: z.string(),
  /** Raids in the same family share one gold claim per week, whatever the mode. */
  family: z.string(),
  name: z.string(),
  mode: RaidModeSchema,
  minIlvl: z.number(),
  /** null = unknown; check in game. */
  gold: z.number().nullable(),
  goldType: GoldTypeSchema,
  /** Needs a party; only planned once the player marks it as learned. */
  groupOnly: z.boolean(),
  patch: z.string(),
  verified: z.boolean(),
})

export const TaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  cadence: z.enum(['daily', 'scheduled']),
  /** Only shown for characters at or above this item level. */
  minIlvl: z.number(),
  /** Per character, or once for the whole roster. */
  scope: z.enum(['character', 'roster']),
  note: z.string().optional(),
})

export const MaterialIdSchema = z.enum([
  'destiny-guardian-stone',
  'destiny-destruction-stone',
  'destiny-leapstone',
  'abidos-fusion',
])

/** Materials (by id) and gold for one honing tap. */
export const TapCostSchema = z.object({
  materials: z.partialRecord(MaterialIdSchema, z.number()),
  gold: z.number(),
})

export const NormalStepSchema = z.object({
  /** Honing from this level to the next. */
  from: z.number().int(),
  piece: PieceTypeSchema,
  /** Base success chance 0–1; null = not checked yet. */
  baseRate: z.number().nullable(),
  cost: TapCostSchema.nullable(),
})

export const AdvancedBandSchema = z.object({
  /** Applies when honing to levels in [fromLevel + 1, toLevel]. */
  fromLevel: z.number().int(),
  toLevel: z.number().int(),
  piece: PieceTypeSchema,
  cost: TapCostSchema.nullable(),
  /** XP needed per level; null = not checked yet. */
  xpPerLevel: z.number().nullable(),
  outcomes: z.array(z.object({ chance: z.number(), xp: z.number().nullable() })),
})

export const HoningSchema = z.object({
  /** Normal honing mechanics; `verified` once confirmed in game. */
  mechanics: z.object({
    /** Each fail adds this fraction of the base rate… */
    failBonus: z.number(),
    /** …up to base rate × this. */
    maxRateMultiplier: z.number(),
    /** Artisan's Energy gained per fail, as a fraction of that tap's success chance. */
    artisanPerFail: z.number(),
    verified: z.boolean(),
  }),
  normal: z.array(NormalStepSchema),
  advanced: z.array(AdvancedBandSchema),
  special: z.object({
    stonesPerAttempt: z.record(PieceTypeSchema, z.number()),
    /** Success chance by the level being honed to, e.g. { "19": 0.03 }. */
    chanceByTargetLevel: z.record(z.string(), z.number()),
  }),
})

export const GameDataSchema = z.object({
  schemaVersion: z.number().int(),
  /** Content version; bump on every data change. */
  version: z.number().int(),
  publishedAt: z.string(),
  changelog: z.array(z.object({ version: z.number().int(), notes: z.array(z.string()) })),
  goldRules: z.object({ raidsPerCharacter: z.number().int(), goldEarnersPerRoster: z.number().int() }),
  raids: z.array(RaidSchema),
  tasks: z.array(TaskSchema),
  /** Event item-level milestones. */
  eventMilestones: z.array(z.number()),
  eventsEnd: z.string(),
  /** Free gear from the Kurzan questline reaches this item level. */
  questIlvl: z.number(),
  honing: HoningSchema,
  /** Default gold per unit, null = unknown; users can override. */
  materialPrices: z.record(MaterialIdSchema, z.number().nullable()),
})

export type GoldType = z.infer<typeof GoldTypeSchema>
export type RaidMode = z.infer<typeof RaidModeSchema>
export type PieceType = z.infer<typeof PieceTypeSchema>
export type Raid = z.infer<typeof RaidSchema>
export type Task = z.infer<typeof TaskSchema>
export type MaterialId = z.infer<typeof MaterialIdSchema>
export type TapCost = z.infer<typeof TapCostSchema>
export type NormalStep = z.infer<typeof NormalStepSchema>
export type AdvancedBand = z.infer<typeof AdvancedBandSchema>
export type GameData = z.infer<typeof GameDataSchema>
