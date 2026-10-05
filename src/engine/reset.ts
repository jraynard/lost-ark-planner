export interface ResetConfig {
  /** UTC hour both daily and weekly resets happen at. */
  resetHourUtc: number
  /** 0 = Sunday … 3 = Wednesday. */
  weeklyResetDay: number
}

/** Wednesday 10:00 UTC, confirmed in game 2026-10-05. */
export const defaultResetConfig: ResetConfig = { resetHourUtc: 10, weeklyResetDay: 3 }

const DAY_MS = 24 * 60 * 60 * 1000

/** Start of the current daily reset period, as an ISO string usable as a key. */
export function dailyPeriodStart(now: Date, cfg: ResetConfig = defaultResetConfig): string {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), cfg.resetHourUtc),
  )
  if (start.getTime() > now.getTime()) start.setTime(start.getTime() - DAY_MS)
  return start.toISOString()
}

/** Start of the current weekly reset period, as an ISO string usable as a key. */
export function weeklyPeriodStart(now: Date, cfg: ResetConfig = defaultResetConfig): string {
  const daily = new Date(dailyPeriodStart(now, cfg))
  const daysSinceReset = (daily.getUTCDay() - cfg.weeklyResetDay + 7) % 7
  return new Date(daily.getTime() - daysSinceReset * DAY_MS).toISOString()
}

export function nextWeeklyReset(now: Date, cfg: ResetConfig = defaultResetConfig): Date {
  return new Date(new Date(weeklyPeriodStart(now, cfg)).getTime() + 7 * DAY_MS)
}
