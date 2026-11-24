// The icons in public/ and the accent swatches in Nav.astro cannot read CSS custom
// properties, so they copy the accent colours from global.css. These tests keep the copies
// in step: change a token there, and the copies must change with it.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const css = read('src/styles/global.css')

/** The custom properties declared by the rule whose selector list is exactly `selector`. */
function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`no rule for ${selector} in global.css`)
  const body = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2]!.trim().toLowerCase()]),
  )
}

const dark = tokens(":root,\n:root[data-theme='dark']")
const light = tokens(":root[data-theme='light']")

// mint is the default, declared in the theme rules; every other accent overrides them.
const accents = ['mint', ...new Set([...css.matchAll(/data-accent='(\w+)'\]/g)].map(m => m[1]!))]

const colours = (accent: string) =>
  accent === 'mint'
    ? { dark, light }
    : {
        dark: { ...dark, ...tokens(`:root[data-accent='${accent}']`) },
        light: { ...light, ...tokens(`:root[data-theme='light'][data-accent='${accent}']`) },
      }

const fills = (svg: string) =>
  new Set([...svg.matchAll(/fill="(#[0-9a-f]{6})"/gi)].map(m => m[1]!.toLowerCase()))

describe.each(accents)('the %s accent', accent => {
  const { dark: d, light: l } = colours(accent)

  it('has a favicon drawn in its dark --acc and --acc-ink', () => {
    const file = accent === 'mint' ? 'favicon.svg' : `favicon-${accent}.svg`
    expect(fills(read(`public/${file}`))).toEqual(new Set([d['--acc'], d['--acc-ink']]))
  })

  it('has a Nav swatch showing its --acc in each theme', () => {
    const swatch = read('src/components/Nav.astro').match(
      new RegExp(`id: '${accent}'.*?dark: '(#\\w+)', light: '(#\\w+)'`),
    )
    expect(swatch?.slice(1).map(hex => hex.toLowerCase())).toEqual([d['--acc'], l['--acc']])
  })
})

it('draws the app icon in the mint accent on the dark --bg', () => {
  expect(fills(read('public/icon.svg'))).toEqual(
    new Set([dark['--bg'], dark['--acc'], dark['--acc-ink']]),
  )
})
