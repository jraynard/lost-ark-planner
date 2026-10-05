import { describe, expect, it } from 'vitest'
import { dailyPeriodStart, nextWeeklyReset, weeklyPeriodStart } from './reset'

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
