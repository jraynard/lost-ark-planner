import { describe, expect, it } from 'vitest'
import { triage } from './triage'

describe('triage', () => {
  it('dismantles low-quality accessories', () => {
    expect(triage({ kind: 'accessory', grade: 'ancient', quality: 50 }).verdict).toBe('dismantle')
  })
  it('checks the Auction House for 67+ ancient accessories', () => {
    expect(triage({ kind: 'accessory', grade: 'ancient', quality: 80 }).verdict).toBe('check')
  })
  it('keeps 67+ relic accessories for alts', () => {
    expect(triage({ kind: 'accessory', grade: 'relic', quality: 70 }).verdict).toBe('keep')
  })
  it('keeps support accessories regardless of quality', () => {
    expect(triage({ kind: 'accessory', grade: 'relic', quality: 40, supportEffects: true }).verdict).toBe('keep')
  })
  it('checks uncut stones and ancient bracelets', () => {
    expect(triage({ kind: 'ability-stone', grade: 'relic', uncut: true }).verdict).toBe('check')
    expect(triage({ kind: 'bracelet', grade: 'ancient' }).verdict).toBe('check')
  })
  it('dismantles everything else', () => {
    expect(triage({ kind: 'other', grade: 'other' }).verdict).toBe('dismantle')
  })
})
