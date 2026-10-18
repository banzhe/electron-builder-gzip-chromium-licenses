import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    semi: false,
    singleQuote: true,
    sortPackageJson: true,
    ignorePatterns: ['**/dist/**', 'pnpm-lock.yaml'],
  },
  lint: {
    plugins: ['typescript', 'unicorn', 'oxc', 'import', 'promise', 'node'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    categories: {
      correctness: 'error',
      suspicious: 'warn',
      perf: 'warn',
    },
    env: { node: true },
    ignorePatterns: ['**/dist/**'],
    options: { typeAware: true, typeCheck: true },
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    overrides: [
      {
        files: ['**/*.test.ts'],
        plugins: ['vitest'],
      },
    ],
  },
  pack: {
    dts: {
      generator: 'tsgo',
    },
  },
})
