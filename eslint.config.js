// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['lib/logger.ts', 'lib/sentry.ts', 'jest.setup.js'],
    rules: {
      'no-console': 'off',
    },
  },
]);
