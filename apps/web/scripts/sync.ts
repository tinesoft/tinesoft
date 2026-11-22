/**
 * Pulls public GitHub data into src/data/github.json, which the build reads.
 * GITHUB_TOKEN is optional: it raises the rate limit and reads the calendar from GraphQL rather
 * than the public contributions page.
 * A section that fails keeps its previous value, so a flaky API never empties the page.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parseContributionsHtml } from '../src/lib/calendar'
import { GITHUB_USER } from '../src/lib/site'
import type {
  ActivityEvent,
  Calendar,
  EventKind,
  Repo,
  Snapshot,
  UpstreamCount,
} from '../src/lib/types'

const OUT = fileURLToPath(new URL('../src/data/github.json', import.meta.url))
const API = 'https://api.github.com'
const token = process.env.GITHUB_TOKEN
const headers: Record<string, string> = {
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
  'user-agent': 'tinesoft-site-sync',
  ...(token ? { authorization: `Bearer ${token}` } : {}),
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers })
  if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`)
  return (await res.json()) as T
}

interface ApiRepo {
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics?: string[]
  fork: boolean
  archived: boolean
  created_at: string
  pushed_at: string
}

async function repos(): Promise<Repo[]> {
  const all: ApiRepo[] = []
  for (let page = 1; ; page++) {
    const batch = await get<ApiRepo[]>(
      `/users/${GITHUB_USER}/repos?type=owner&per_page=100&page=${page}`,
    )
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all.map(r => ({
    name: r.name,
    description: r.description,
    url: r.html_url,
    stars: r.stargazers_count,
    language: r.language,
    topics: r.topics ?? [],
    fork: r.fork,
    archived: r.archived,
    createdAt: r.created_at,
    pushedAt: r.pushed_at,
  }))
}

interface ApiEvent {
  type: string
  repo: { name: string }
  created_at: string
  payload: { action?: string; ref_type?: string; pull_request?: { merged?: boolean } }
}

function eventKind(e: ApiEvent): EventKind | null {
  const { action, pull_request: pr, ref_type: refType } = e.payload
  switch (e.type) {
    case 'PushEvent':
      return 'push'
    case 'ReleaseEvent':
      return action === 'published' ? 'release' : null
    case 'PullRequestEvent':
      if (action === 'opened') return 'pr-opened'
      return action === 'closed' && pr?.merged ? 'pr-merged' : null
    case 'PullRequestReviewEvent':
      return 'review'
    case 'IssuesEvent':
      return action === 'opened' ? 'issue' : null
    case 'IssueCommentEvent':
      return 'comment'
    case 'CreateEvent':
      return refType === 'repository' ? 'create' : null
    case 'WatchEvent':
      return 'star'
    case 'ForkEvent':
      return 'fork'
    default:
      return null
  }
}

async function events(): Promise<ActivityEvent[]> {
  const raw = await get<ApiEvent[]>(`/users/${GITHUB_USER}/events/public?per_page=100`)
  return raw.flatMap(e => {
    const kind = eventKind(e)
    return kind ? [{ kind, repo: e.repo.name, at: e.created_at }] : []
  })
}

interface Search {
  total_count: number
  items: { repository_url: string }[]
}

const search = (q: string, page = 1, perPage = 100) =>
  get<Search>(`/search/issues?q=${encodeURIComponent(q)}&per_page=${perPage}&page=${page}`)

async function mergedPrs(): Promise<number> {
  return (await search(`type:pr author:${GITHUB_USER} is:merged`, 1, 1)).total_count
}

async function upstream(): Promise<UpstreamCount[]> {
  const counts = new Map<string, number>()
  for (let page = 1; page <= 5; page++) {
    const { items } = await search(`type:pr author:${GITHUB_USER} -user:${GITHUB_USER}`, page)
    for (const { repository_url: url } of items) {
      const repo = url.replace(`${API}/repos/`, '')
      counts.set(repo, (counts.get(repo) ?? 0) + 1)
    }
    if (items.length < 100) break
  }
  return [...counts].map(([repo, count]) => ({ repo, count })).sort((a, b) => b.count - a.count)
}

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

async function calendar(): Promise<Calendar> {
  if (!token) {
    const res = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
      headers: { 'user-agent': headers['user-agent']! },
    })
    if (!res.ok) throw new Error(`contributions page: ${res.status}`)
    return parseContributionsHtml(await res.text())
  }
  const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
    totalContributions weeks { contributionDays { contributionLevel } } } } } }`
  const res = await fetch(`${API}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables: { login: GITHUB_USER } }),
  })
  const body = (await res.json()) as {
    data?: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number
            weeks: { contributionDays: { contributionLevel: string }[] }[]
          }
        }
      }
    }
    errors?: unknown
  }
  const cal = body.data?.user.contributionsCollection.contributionCalendar
  if (!cal) throw new Error(`GraphQL: ${res.status} ${JSON.stringify(body.errors)}`)
  return {
    total: cal.totalContributions,
    weeks: cal.weeks.map(w => w.contributionDays.map(d => LEVELS[d.contributionLevel] ?? 0)),
  }
}

async function previous(): Promise<Partial<Snapshot>> {
  try {
    return JSON.parse(await readFile(OUT, 'utf8')) as Snapshot
  } catch {
    return {}
  }
}

async function keep<K extends keyof Snapshot>(
  name: K,
  fetcher: () => Promise<Snapshot[K]>,
  prev: Partial<Snapshot>,
  fallback: Snapshot[K],
): Promise<Snapshot[K]> {
  try {
    const value = await fetcher()
    console.log(`✓ ${name}`)
    return value
  } catch (err) {
    console.warn(`! ${name}: ${(err as Error).message.split('\n')[0]}; keeping the previous value`)
    return prev[name] ?? fallback
  }
}

const prev = await previous()
const snapshot: Snapshot = {
  syncedAt: new Date().toISOString(),
  user: GITHUB_USER,
  repos: await keep('repos', repos, prev, []),
  events: await keep('events', events, prev, []),
  mergedPrs: await keep('mergedPrs', mergedPrs, prev, 0),
  upstream: await keep('upstream', upstream, prev, []),
  calendar: await keep('calendar', calendar, prev, null),
}
if (!snapshot.repos.length) {
  console.error('No repos fetched and none cached: refusing to write an empty snapshot.')
  process.exit(1)
}
await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`)
console.log(`Wrote ${OUT}`)
