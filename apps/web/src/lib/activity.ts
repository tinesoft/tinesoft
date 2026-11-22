import type { ActivityEvent, EventKind, UpstreamCount } from './types'

export const EVENT_COPY: Record<EventKind, { glyph: string; verb: string; tone: 0 | 1 }> = {
  push: { glyph: '↑', verb: 'Pushed commits to', tone: 0 },
  release: { glyph: '★', verb: 'Published a release of', tone: 1 },
  'pr-opened': { glyph: '⇄', verb: 'Opened a pull request on', tone: 0 },
  'pr-merged': { glyph: '✓', verb: 'Merged a pull request on', tone: 1 },
  review: { glyph: '◎', verb: 'Reviewed a pull request on', tone: 1 },
  issue: { glyph: '!', verb: 'Opened an issue in', tone: 0 },
  comment: { glyph: '“', verb: 'Commented in', tone: 1 },
  create: { glyph: '◆', verb: 'Created', tone: 1 },
  star: { glyph: '☆', verb: 'Starred', tone: 0 },
  fork: { glyph: '⑂', verb: 'Forked', tone: 0 },
}

/** Most recent first, one row per kind and repo, so a burst of pushes reads as one line. */
export function feed(events: ActivityEvent[], limit = 6): ActivityEvent[] {
  const seen = new Set<string>()
  return events
    .slice()
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter(e => {
      const key = `${e.kind} ${e.repo}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, limit)
}

export function topUpstream(upstream: UpstreamCount[], limit = 3) {
  const top = upstream
    .slice()
    .sort((a, b) => b.count - a.count || a.repo.localeCompare(b.repo))
    .slice(0, limit)
  const max = top[0]?.count ?? 1
  return top.map(u => ({ ...u, pct: Math.round((u.count / max) * 100) }))
}
