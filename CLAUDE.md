# tinesoft

Tine Kondo's GitHub profile repo and the source of [tinesoft.com](https://tinesoft.com). One Nx workspace; the site is the `web` project in `apps/web/` (Astro, static, vanilla TS, no UI framework). `README.md` at the root is the GitHub profile README: leave its layout alone (Prettier ignores it).

## Branches and commits

- Branch from `main` as `feat/...`, `fix/...` or `chore/...`, and open a PR to `main`. Every push to `main` deploys.
- History is linear: rebase, then fast-forward (`git merge --ff-only`). A `pre-merge-commit` hook and a CI check reject merge commits.
- Conventional Commits, with the scope a project name (`web`) or one of `repo`, `ci`, `deps`, `readme`. commitlint rejects anything else, on commits and PR titles.

## The site

- Data: `pnpm sync` (`nx sync-data web`) writes public GitHub data to `apps/web/src/data/github.json`. The deploy workflow runs it before every build, so the committed file is only a seed for local work; refresh it when you want local data current.
- Which repos show, and their category: `apps/web/src/lib/curation.ts` (exclude/include lists, hand-written copy) and `classify` in `apps/web/src/lib/projects.ts`. Keep logic in `src/lib/` pure and tested; components only render.
- Theme: every colour is a CSS custom property in `apps/web/src/styles/global.css`, keyed by `data-theme` (dark | light) and `data-accent` (mint | terracotta) on `<html>`. The theme follows `prefers-color-scheme` until the visitor picks one with the toggle; picking the system's own theme clears the choice. Never hard-code a colour in a component. The icons in `apps/web/public/` and the swatches in `Nav.astro` copy the accent tokens; `tests/accent-copies.test.ts` keeps them in step, and a new accent needs its own `favicon-<accent>.svg`.
- Motion: client scripts animate through `every`/`onceVisible`/`tween` in `src/scripts/motion.ts`, which pause offscreen and honour `prefers-reduced-motion`.
- Inline elements: Astro's `compressHTML` drops whitespace between tags across a newline; write `{' '}` where a space must survive.
- The design lives in a claude.ai Design canvas ("tinesoft — homepage redesign"); the AI lab previews are illustrative by design.

## Checks

```sh
pnpm nx run-many -t lint typecheck test build --output-style=static
pnpm prettier --check .
```

CI runs the same (affected only), plus the linear-history check and commitlint on the PR title and commits.
