export const GITHUB_USER = 'tinesoft'
export const SITE_URL = 'https://tinesoft.com'

export const CATEGORIES = {
  ai: 'ai & agents',
  plugins: 'plugins',
  cli: 'cli & generators',
  libs: 'libraries',
} as const

export type Category = keyof typeof CATEGORIES

export const SOCIALS = [
  { name: 'GitHub', handle: '@tinesoft', href: 'https://github.com/tinesoft' },
  { name: 'X / Twitter', handle: '@tinesoft', href: 'https://twitter.com/tinesoft' },
  { name: 'LinkedIn', handle: 'in/tine-kondo', href: 'https://www.linkedin.com/in/tine-kondo' },
  { name: 'dev.to', handle: '@tinesoft', href: 'https://dev.to/tinesoft' },
  { name: 'Stack Overflow', handle: 'tinesoft', href: 'https://stackoverflow.com/users/tinesoft' },
] as const
