export type Theme = 'dark' | 'light'
export type Accent = 'mint' | 'terracotta'

const KEY = { theme: 'tinesoft:theme', accent: 'tinesoft:accent' } as const
const root = document.documentElement

export const currentTheme = (): Theme => (root.dataset.theme === 'light' ? 'light' : 'dark')
export const currentAccent = (): Accent =>
  root.dataset.accent === 'terracotta' ? 'terracotta' : 'mint'

const listeners = new Set<() => void>()
export const onPreferencesChange = (fn: () => void) => listeners.add(fn)

function save(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* private mode: the choice lasts for this page only */
  }
}

function stored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const systemLight = matchMedia('(prefers-color-scheme: light)')
const systemTheme = (): Theme => (systemLight.matches ? 'light' : 'dark')

function applyTheme(theme: Theme): void {
  root.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim())
  listeners.forEach(fn => fn())
}

/**
 * Picks a theme by hand. Picking the one the system already uses forgets the choice,
 * so the site goes back to following the system.
 */
export function setTheme(theme: Theme): void {
  save(KEY.theme, theme === systemTheme() ? null : theme)
  applyTheme(theme)
}

// With no choice stored, follow the system theme as it changes.
systemLight.addEventListener('change', () => {
  if (!stored(KEY.theme)) applyTheme(systemTheme())
})

export function setAccent(accent: Accent): void {
  root.dataset.accent = accent
  save(KEY.accent, accent)
  listeners.forEach(fn => fn())
}
