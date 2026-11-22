import type { Calendar } from './types'

/**
 * Reads the calendar out of github.com/users/<user>/contributions, the HTML fragment
 * the profile page loads. It needs no token, unlike the GraphQL calendar.
 */
export function parseContributionsHtml(html: string): Calendar {
  const days = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="(\d)"/g)]
    .map(([, date, level]) => ({ date: date!, level: Number(level) }))
    .sort((a, b) => a.date.localeCompare(b.date))
  if (!days.length) throw new Error('no contribution days in the HTML')

  const first = new Date(`${days[0]!.date}T00:00:00Z`)
  const start = first.getTime() - first.getUTCDay() * 86_400_000
  const weeks: number[][] = []
  for (const { date, level } of days) {
    const offset = Math.round((new Date(`${date}T00:00:00Z`).getTime() - start) / 86_400_000)
    ;(weeks[Math.floor(offset / 7)] ??= [])[offset % 7] = level
  }
  const total = Number(
    html.match(/([\d,]+)\s+contributions\s+in the last year/)?.[1]?.replace(/,/g, '') ?? 0,
  )
  return { total, weeks: weeks.map(w => Array.from({ length: w.length }, (_, i) => w[i] ?? 0)) }
}
