import { EXCLUDE, INCLUDE, MIN_STARS, NEW_DAYS, OVERRIDES } from './curation'
import { cleanDescription, daysBetween, starsLabel, updatedLabel } from './format'
import type { Category } from './site'
import type { Repo } from './types'

export interface Project {
  name: string
  url: string
  description: string
  category: Category
  stars: number
  starsLabel: string
  language: string
  pushedAt: string
  updatedLabel: string
  isNew: boolean
  tags: string[]
  /** 1-based position when sorted by popularity, then by recency. */
  rank: { popular: number; recent: number }
}

const RULES: [Category, string[], RegExp][] = [
  [
    'ai',
    [
      'ai',
      'agents',
      'llm',
      'mcp',
      'claude-code',
      'claude-plugins',
      'claude-mods',
      'spec-kit',
      'spec-driven-development',
    ],
    /\b(ai|agents?|claude|llm|spec[- ]kit)\b/i,
  ],
  [
    'plugins',
    ['nx', 'nx-plugin', 'plugin', 'eslint-plugin', 'github-actions'],
    /\bplugins?\b|github @?actions?/i,
  ],
  [
    'cli',
    ['cli', 'tui', 'generator', 'yeoman-generator', 'schematics'],
    /\b(cli|generator|schematics)\b/i,
  ],
]

const NOISE_TOPICS = new Set(['hacktoberfest', 'devtools'])

/** First matching rule wins: topics, then the description. Anything else is a library. */
export function classify(repo: Pick<Repo, 'topics' | 'description'>): Category {
  for (const [category, topics] of RULES) {
    if (repo.topics.some(t => topics.includes(t))) return category
  }
  for (const [category, , pattern] of RULES) {
    if (repo.description && pattern.test(repo.description)) return category
  }
  return 'libs'
}

export function isShown(repo: Repo, now: Date): boolean {
  if (repo.fork || repo.archived || !repo.description || EXCLUDE.has(repo.name)) return false
  return (
    INCLUDE.has(repo.name) ||
    repo.stars >= MIN_STARS ||
    daysBetween(repo.createdAt, now) <= NEW_DAYS
  )
}

const byPopular = (a: Repo, b: Repo) => b.stars - a.stars || b.pushedAt.localeCompare(a.pushedAt)
const byRecent = (a: Repo, b: Repo) => b.pushedAt.localeCompare(a.pushedAt) || b.stars - a.stars

export function toProjects(repos: Repo[], now: Date): Project[] {
  const shown = repos.filter(r => isShown(r, now))
  const popular = shown.slice().sort(byPopular)
  const recent = shown.slice().sort(byRecent)
  return popular.map(repo => {
    const o = OVERRIDES[repo.name] ?? {}
    const topics = repo.topics.filter(t => !NOISE_TOPICS.has(t))
    const language = o.language ?? repo.language ?? 'Other'
    return {
      name: repo.name,
      url: repo.url,
      description: o.description ?? cleanDescription(repo.description ?? ''),
      category: o.category ?? classify(repo),
      stars: repo.stars,
      starsLabel: starsLabel(repo.stars),
      language,
      pushedAt: repo.pushedAt,
      updatedLabel: updatedLabel(repo.pushedAt, now),
      isNew: daysBetween(repo.createdAt, now) <= NEW_DAYS,
      tags: o.tags ?? (topics.length ? topics.slice(0, 2) : [language.toLowerCase()]),
      rank: { popular: popular.indexOf(repo) + 1, recent: recent.indexOf(repo) + 1 },
    }
  })
}
