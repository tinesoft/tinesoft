# Contributing

## Set up

Requires Node 22.23 or later and pnpm.

```sh
pnpm install   # also installs the Git hooks (Husky) and sets merge/pull to fast-forward only
pnpm dev       # http://localhost:4321
```

## Commands

| Command               | What it does                                                                           |
| --------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`            | Astro dev server                                                                       |
| `pnpm sync`           | Pull public GitHub data into `apps/web/src/data/github.json` (`GITHUB_TOKEN` optional) |
| `pnpm build`          | Static build into `apps/web/dist`                                                      |
| `pnpm nx preview web` | Serve the build, with the service worker                                               |
| `pnpm check`          | `nx affected -t lint typecheck test build`                                             |
| `pnpm format`         | Prettier                                                                               |

## Branches and commits

- Branch from `main` as `feat/...`, `fix/...` or `chore/...`, and open a PR to `main`.
- History is linear. Rebase onto `main`, then fast-forward; merge commits are rejected by a hook and by CI.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org). The scope is a project name (`web`) or one of `repo`, `ci`, `deps`, `readme`. CI checks the PR title too.

The Git hooks run on every commit:

- `pre-commit` runs Prettier and `eslint --fix` on staged files.
- `commit-msg` runs commitlint.
- `pre-merge-commit` refuses merge commits.

## Deployment

`.github/workflows/deploy.yml` syncs GitHub data, builds and publishes to GitHub Pages on every push to `main`, daily at 05:17 UTC, and on demand. `apps/web/public/CNAME` points Pages at `tinesoft.com`.
