import { describe, expect, it } from 'vitest'
import { cleanDescription, starsLabel, timeAgo, updatedLabel } from '../src/lib/format'

const NOW = new Date('2026-11-22T12:00:00Z')

describe('format', () => {
  it('abbreviates thousands of stars', () => {
    expect(starsLabel(328)).toBe('328')
    expect(starsLabel(1234)).toBe('1.2k')
    expect(starsLabel(12_345)).toBe('12k')
  })

  it('says how recently a repo moved', () => {
    expect(updatedLabel('2026-11-01T00:00:00Z', NOW)).toBe('recent')
    expect(updatedLabel('2026-08-01T00:00:00Z', NOW)).toBe('active')
    expect(updatedLabel('2019-10-27T00:00:00Z', NOW)).toBe('Oct 2019')
  })

  it('says how long ago an event was', () => {
    expect(timeAgo('2026-11-22T11:59:40Z', NOW)).toBe('just now')
    expect(timeAgo('2026-11-22T11:18:00Z', NOW)).toBe('42 min')
    expect(timeAgo('2026-11-22T09:00:00Z', NOW)).toBe('3 h')
    expect(timeAgo('2026-11-20T09:00:00Z', NOW)).toBe('2 d')
  })

  it('drops emoji shortcodes from descriptions', () => {
    expect(cleanDescription('Cookie :cookie: Consent module')).toBe('Cookie Consent module')
  })
})
