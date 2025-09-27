module.exports = [
  {
    ignores: ['node_modules/**', 'public/**', 'storage/**', 'vendor/**'],
  },
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {},
  },
];
