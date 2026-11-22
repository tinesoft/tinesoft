import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/.nx/**', '**/dist/**', '**/.astro/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.{ts,astro}'],
    rules: { '@typescript-eslint/consistent-type-imports': 'error' },
  },
  {
    files: ['**/public/**/*.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    files: ['**/*.mjs', '**/scripts/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
)
