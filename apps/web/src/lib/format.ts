const DAY = 86_400_000

export const daysBetween = (from: string | Date, to: Date): number =>
  (to.getTime() - new Date(from).getTime()) / DAY

export function starsLabel(stars: number): string {
  if (stars >= 1000) return `${(stars / 1000).toFixed(stars >= 10_000 ? 0 : 1)}k`
  return String(stars)
}

export function updatedLabel(pushedAt: string, now: Date): string {
  const days = daysBetween(pushedAt, now)
  if (days < 30) return 'recent'
  if (days < 180) return 'active'
  return new Date(pushedAt).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function timeAgo(at: string, now: Date): string {
  const minutes = Math.floor((now.getTime() - new Date(at).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} d`
}

/** Strips GitHub `:emoji:` shortcodes and stray whitespace from a repo description. */
export const cleanDescription = (text: string): string =>
  text
    .replace(/:[a-z0-9_+-]+:/g, '')
    .replace(/\s+/g, ' ')
    .trim()
