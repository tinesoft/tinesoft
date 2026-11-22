/** Raw data the sync job pulls from GitHub. Classification and ranking happen at build time. */
export interface Repo {
  name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  topics: string[]
  fork: boolean
  archived: boolean
  createdAt: string
  pushedAt: string
}

export type EventKind =
  | 'push'
  | 'release'
  | 'pr-opened'
  | 'pr-merged'
  | 'review'
  | 'issue'
  | 'comment'
  | 'create'
  | 'star'
  | 'fork'

export interface ActivityEvent {
  kind: EventKind
  repo: string
  at: string
}

export interface UpstreamCount {
  repo: string
  count: number
}

export interface Calendar {
  total: number
  /** One array per week, Sunday first, each day a level from 0 (none) to 4. */
  weeks: number[][]
}

export interface Snapshot {
  syncedAt: string
  user: string
  repos: Repo[]
  events: ActivityEvent[]
  mergedPrs: number
  upstream: UpstreamCount[]
  calendar: Calendar | null
}
