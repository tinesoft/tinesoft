import { describe, expect, it } from 'vitest'
import { feed, topUpstream } from '../src/lib/activity'
import { parseContributionsHtml } from '../src/lib/calendar'

describe('feed', () => {
  it('keeps one row per kind and repo, newest first', () => {
    const rows = feed([
      { kind: 'push', repo: 'a/x', at: '2026-11-20T00:00:00Z' },
      { kind: 'push', repo: 'a/x', at: '2026-11-22T00:00:00Z' },
      { kind: 'release', repo: 'a/x', at: '2026-11-21T00:00:00Z' },
      { kind: 'push', repo: 'a/y', at: '2026-11-19T00:00:00Z' },
    ])
    expect(rows.map(r => `${r.kind} ${r.repo} ${r.at.slice(8, 10)}`)).toEqual([
      'push a/x 22',
      'release a/x 21',
      'push a/y 19',
    ])
  })
})

describe('topUpstream', () => {
  it('ranks repos and scales bars to the top one', () => {
    expect(
      topUpstream([
        { repo: 'b', count: 5 },
        { repo: 'a', count: 20 },
        { repo: 'c', count: 10 },
        { repo: 'd', count: 1 },
      ]),
    ).toEqual([
      { repo: 'a', count: 20, pct: 100 },
      { repo: 'c', count: 10, pct: 50 },
      { repo: 'b', count: 5, pct: 25 },
    ])
  })
})

describe('parseContributionsHtml', () => {
  it('groups days into Sunday-first weeks and reads the total', () => {
    const day = (date: string, level: number) =>
      `<td data-date="${date}" id="contribution-day-component-0-0" data-level="${level}"></td>`
    const html = [
      day('2026-11-09', 3), // Monday, so Sunday the 8th is padded
      day('2026-11-08', 0),
      day('2026-11-15', 4),
      '<h2>\n  1,084\n  contributions\n  in the last year\n</h2>',
    ].join('')
    expect(parseContributionsHtml(html)).toEqual({ total: 1084, weeks: [[0, 3], [4]] })
  })
})
