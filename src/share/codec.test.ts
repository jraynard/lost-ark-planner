import { deflateSync, strToU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { seedRoster } from '../data/seed-roster'
import { decodeShare, encodeShare, SHARE_PREFIX, ShareCodeError } from './codec'

const drafts = seedRoster.map(({ id: _id, ...rest }) => rest)

const checklist = {
  weekly: { period: '2026-09-30T10:00:00.000Z', ticks: [{ character: 0, id: 'act4-solo' }, { character: 2, id: 'aegir-solo' }] },
  daily: { period: '2026-10-05T10:00:00.000Z', ticks: [{ character: 1, id: 'kurzan-front' }, { character: null, id: 'chaos-gate' }] },
}

describe('share codec', () => {
  it('round-trips the example roster', () => {
    const code = encodeShare({ characters: drafts })
    expect(code.startsWith(SHARE_PREFIX)).toBe(true)
    const decoded = decodeShare(code)
    expect(decoded.characters).toHaveLength(6)
    decoded.characters.forEach((c, i) => {
      expect(c).toMatchObject({ ...drafts[i], ilvl: expect.closeTo(drafts[i].ilvl, 2) })
    })
    expect(decoded.checklist).toBeUndefined()
  })

  it('round-trips checklist ticks', () => {
    const decoded = decodeShare(encodeShare({ characters: drafts, checklist }))
    expect(decoded.checklist).toEqual(checklist)
  })

  it('is short enough for SMS and QR', () => {
    expect(encodeShare({ characters: drafts, checklist }).length).toBeLessThan(600)
  })

  it('accepts a share link and stray whitespace', () => {
    const code = encodeShare({ characters: drafts })
    const link = `http://192.168.1.5:5173/#/import?d=${encodeURIComponent(code)}`
    expect(decodeShare(link).characters).toHaveLength(6)
    expect(decodeShare(`  ${code.slice(0, 20)}\n${code.slice(20)} `).characters).toHaveLength(6)
  })

  it('rejects junk, truncated, oversized and invalid codes', () => {
    const code = encodeShare({ characters: drafts })
    const fake = (json: unknown) => SHARE_PREFIX + btoa(String.fromCharCode(...deflateSync(strToU8(JSON.stringify(json))))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect(() => decodeShare('hello')).toThrow(ShareCodeError)
    expect(() => decodeShare(code.slice(0, code.length - 30))).toThrow(ShareCodeError)
    expect(() => decodeShare(SHARE_PREFIX + 'A'.repeat(9000))).toThrow(/too long/)
    expect(() => decodeShare(SHARE_PREFIX + '$$$')).toThrow(ShareCodeError)
    expect(() => decodeShare(fake({ c: [] }))).toThrow(ShareCodeError)
    expect(() => decodeShare(fake({ c: [['x'.repeat(41), '', 0, 1, 166000, []]] }))).toThrow(ShareCodeError)
  })
})
