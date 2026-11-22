import type { Category } from './site'

/** Public repos that are not tools: profile, config, demos, sandboxes. */
export const EXCLUDE = new Set([
  'tinesoft',
  'tinesoft.github.io',
  '.trunk',
  'OSSRH-50241',
  'dotfiles',
  'ngx-autobot',
  'schematics-releaser',
  'skills',
  'spec-kit-token-budget-demo',
  'revealjs-webpack-demo',
  'tutorials',
  'nba-tracker-app',
  'nx-multi-stacks-monorepo',
  'streamlit-playground',
  'appengine-maven-plugin',
  'gwt-pixlr',
  'cute-collage',
])

/** Shown whatever their stars or age. */
export const INCLUDE = new Set(['ngx-storybook-schematics', 'generator-ngx-library'])

/** A repo with fewer stars than this is shown only when it is new or in INCLUDE. */
export const MIN_STARS = 5

/** A repo created this many days ago or less counts as new, and is shown. */
export const NEW_DAYS = 120

export interface Override {
  description?: string
  category?: Category
  language?: string
  tags?: string[]
}

/** Hand-written copy that reads better than the GitHub description. */
export const OVERRIDES: Record<string, Override> = {
  spectatui: {
    description:
      'A terminal dashboard for GitHub Spec-Kit: specs, plans, tasks, workflow stages and agent sessions.',
  },
  aikill: {
    description:
      'Find and reclaim the disk space that 20 AI coding agents leave behind, with Safe / Review / Keep triage.',
    tags: ['tui', 'cli'],
  },
  'ai-plugins': {
    description:
      'Claude Code plugins for git workflow, context tooling and mattpocock-skills extras.',
    language: 'Claude Code',
    tags: ['claude-code', 'plugins'],
  },
  nxrocks: {
    description:
      'Nx plugins and create-nx CLIs that bring Spring Boot, Quarkus, Micronaut, Ktor, Flutter and Melos into one workspace.',
    tags: ['nx', 'jvm', 'flutter'],
  },
  'ngx-cookieconsent': {
    description: 'Cookie Consent module for Angular, with standalone and NgModule setups.',
    language: 'TypeScript',
    tags: ['angular', 'gdpr'],
  },
  'claude-mods': {
    description:
      'A set of mods to enhance your UX and DX on Claude Code, published as one plugin marketplace.',
    tags: ['claude-code', 'plugins', 'skills'],
  },
  'generator-ngx-library': {
    description:
      'Yeoman generator to bootstrap Angular library creation and publication, with demo app, CI/CD and coverage built in.',
    tags: ['yeoman', 'angular'],
  },
  'ngx-storybook-schematics': {
    description: 'Schematics to add Storybook support to Angular CLI projects in one command.',
    tags: ['schematics', 'storybook'],
  },
}
