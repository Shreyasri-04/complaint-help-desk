import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Data fetching on mount via an effect is the idiomatic pattern for a
      // REST-backed SPA (see https://react.dev/learn/you-might-not-need-an-effect).
      // The compiler-backed rule flags even that documented pattern, so relax it
      // while keeping all other React Hooks rules at their recommended level.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
