import nxScopes from '@commitlint/config-nx-scopes'

const { getProjects } = nxScopes.utils

export default {
  extends: ['@commitlint/config-conventional', '@commitlint/config-nx-scopes'],
  rules: {
    'scope-enum': async ctx => [2, 'always', [...getProjects(ctx), 'repo', 'ci', 'deps', 'readme']],
  },
}
