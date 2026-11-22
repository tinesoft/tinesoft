export type Theme = 'dark' | 'light'
export type Accent = 'mint' | 'terracotta'

const KEY = { theme: 'tinesoft:theme', accent: 'tinesoft:accent' } as const
const root = document.documentElement

export const currentTheme = (): Theme => (root.dataset.theme === 'light' ? 'light' : 'dark')
export const currentAccent = (): Accent =>
  root.dataset.accent === 'terracotta' ? 'terracotta' : 'mint'

const listeners = new Set<() => void>()
export const onPreferencesChange = (fn: () => void) => listeners.add(fn)

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode: the choice lasts for this page only */
  }
}

export function setTheme(theme: Theme): void {
  root.dataset.theme = theme
  save(KEY.theme, theme)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim())
  listeners.forEach(fn => fn())
}

export function setAccent(accent: Accent): void {
  root.dataset.accent = accent
  save(KEY.accent, accent)
  listeners.forEach(fn => fn())
}
