import { describe, expect, it } from 'vitest'
import { classify, isShown, toProjects } from '../src/lib/projects'
import type { Repo } from '../src/lib/types'

const NOW = new Date('2026-11-22T00:00:00Z')

const repo = (over: Partial<Repo>): Repo => ({
  name: 'thing',
  description: 'A thing',
  url: 'https://github.com/tinesoft/thing',
  stars: 10,
  language: 'TypeScript',
  topics: [],
  fork: false,
  archived: false,
  createdAt: '2020-01-01T00:00:00Z',
  pushedAt: '2024-01-01T00:00:00Z',
  ...over,
})

describe('classify', () => {
  it('reads topics before the description', () => {
    expect(classify({ topics: ['nx'], description: 'An AI helper' })).toBe('plugins')
  })

  it('falls back to the description', () => {
    expect(classify({ topics: [], description: 'Claude Code plugins for git' })).toBe('ai')
    expect(classify({ topics: [], description: 'Yeoman generator for libraries' })).toBe('cli')
  })

  it('treats AI before plugins when both match', () => {
    expect(classify({ topics: ['claude-code', 'nx'], description: null })).toBe('ai')
  })

  it('calls anything else a library', () => {
    expect(classify({ topics: ['angular'], description: 'Cookie consent for Angular' })).toBe(
      'libs',
    )
  })
})

describe('isShown', () => {
  it('hides forks, archived, undescribed and excluded repos', () => {
    expect(isShown(repo({ fork: true }), NOW)).toBe(false)
    expect(isShown(repo({ archived: true }), NOW)).toBe(false)
    expect(isShown(repo({ description: null }), NOW)).toBe(false)
    expect(isShown(repo({ name: 'dotfiles' }), NOW)).toBe(false)
  })

  it('shows popular or new repos, and hides old quiet ones', () => {
    expect(isShown(repo({ stars: 5 }), NOW)).toBe(true)
    expect(isShown(repo({ stars: 0, createdAt: '2026-10-01T00:00:00Z' }), NOW)).toBe(true)
    expect(isShown(repo({ stars: 0 }), NOW)).toBe(false)
  })
})

describe('toProjects', () => {
  const repos = [
    repo({ name: 'old-star', stars: 300, pushedAt: '2023-01-01T00:00:00Z' }),
    repo({
      name: 'fresh',
      stars: 0,
      createdAt: '2026-11-01T00:00:00Z',
      pushedAt: '2026-11-20T00:00:00Z',
    }),
    repo({
      name: 'mid',
      stars: 50,
      pushedAt: '2026-06-01T00:00:00Z',
      topics: ['hacktoberfest', 'cli'],
    }),
  ]
  const projects = toProjects(repos, NOW)

  it('orders by stars and ranks both sorts', () => {
    expect(projects.map(p => p.name)).toEqual(['old-star', 'mid', 'fresh'])
    expect(projects.map(p => p.rank.recent)).toEqual([3, 2, 1])
  })

  it('labels freshness, newness and tags', () => {
    const [oldStar, mid, fresh] = projects
    expect(oldStar!.updatedLabel).toBe('Jan 2023')
    expect(mid!.updatedLabel).toBe('active')
    expect(fresh!.updatedLabel).toBe('recent')
    expect(fresh!.isNew).toBe(true)
    expect(mid!.tags).toEqual(['cli'])
    expect(mid!.category).toBe('cli')
    expect(oldStar!.tags).toEqual(['typescript'])
  })

  it('applies curated overrides', () => {
    const [nx] = toProjects([repo({ name: 'nxrocks', topics: ['nx'] })], NOW)
    expect(nx!.tags).toEqual(['nx', 'jvm', 'flutter'])
    expect(nx!.description).toMatch(/^Nx plugins and create-nx CLIs/)
  })
})
