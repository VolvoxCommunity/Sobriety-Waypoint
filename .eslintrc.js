module.exports = {
  extends: ['expo', 'prettier'],
  overrides: [
    {
      files: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
        'jest.setup.js',
        'jest.config.js',
      ],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'no-undef': 'off', // Jest globals are available in test files
      },
    },
  ],
};
