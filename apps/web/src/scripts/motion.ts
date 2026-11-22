export const prefersReducedMotion = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Calls `fn` every `ms` with a tick count, only while `el` is on screen and the tab is visible.
 * Under reduced motion it calls `fn` once with `still`, so the element shows a settled state.
 */
export function every(el: Element | null, ms: number, fn: (tick: number) => void, still = 0): void {
  if (!el) return
  if (prefersReducedMotion()) {
    fn(still)
    return
  }
  let tick = 0
  let timer: ReturnType<typeof setInterval> | undefined
  let onScreen = false
  const sync = () => {
    const run = onScreen && !document.hidden
    if (run && !timer) timer = setInterval(() => fn(++tick), ms)
    if (!run && timer) timer = clearInterval(timer) as undefined
  }
  new IntersectionObserver(([entry]) => {
    onScreen = !!entry?.isIntersecting
    sync()
  }).observe(el)
  document.addEventListener('visibilitychange', sync)
  fn(tick)
}

/** Runs `fn` once, the first time `el` scrolls into view. */
export function onceVisible(el: Element | null, fn: () => void): void {
  if (!el) return
  const io = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    io.disconnect()
    fn()
  })
  io.observe(el)
}

/** Eases 0 → 1 over `ms` with a cubic ease-out, calling `fn` each frame. */
export function tween(ms: number, fn: (k: number) => void): void {
  if (prefersReducedMotion()) return fn(1)
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms)
    fn(1 - Math.pow(1 - t, 3))
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
