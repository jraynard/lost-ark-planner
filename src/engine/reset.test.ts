import { describe, expect, it } from 'vitest'
import { dailyPeriodStart, formatCountdown, nextDailyReset, nextWeeklyReset, weeklyPeriodStart } from './reset'

// Oct 7, 2026 is a Wednesday. Default reset: 10:00 UTC.
describe('reset periods', () => {
  it('daily period starts at 10:00 UTC, rolling back before the reset', () => {
    expect(dailyPeriodStart(new Date('2026-10-05T12:00:00Z'))).toBe('2026-10-05T10:00:00.000Z')
    expect(dailyPeriodStart(new Date('2026-10-05T09:59:00Z'))).toBe('2026-10-04T10:00:00.000Z')
  })

  it('weekly period starts on Wednesday at reset', () => {
    expect(weeklyPeriodStart(new Date('2026-10-05T12:00:00Z'))).toBe('2026-09-30T10:00:00.000Z')
    expect(weeklyPeriodStart(new Date('2026-10-07T09:59:00Z'))).toBe('2026-09-30T10:00:00.000Z')
    expect(weeklyPeriodStart(new Date('2026-10-07T10:00:00Z'))).toBe('2026-10-07T10:00:00.000Z')
  })

  it('next weekly reset is a week after the period start', () => {
    expect(nextWeeklyReset(new Date('2026-10-05T12:00:00Z')).toISOString()).toBe('2026-10-07T10:00:00.000Z')
  })
})

describe('countdowns', () => {
  it('next daily reset and formatting', () => {
    const now = new Date('2026-10-05T12:00:00Z')
    expect(nextDailyReset(now).toISOString()).toBe('2026-10-06T10:00:00.000Z')
    expect(formatCountdown(now, nextWeeklyReset(now))).toBe('1d 22h')
    expect(formatCountdown(now, new Date('2026-10-05T17:30:00Z'))).toBe('5h 30m')
    expect(formatCountdown(now, new Date('2026-10-05T12:08:00Z'))).toBe('8m')
  })
})
