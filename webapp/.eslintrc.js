module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:react-hooks/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/babel',
    'prettier/react',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    'react/prop-types': 0,
    'import/prefer-default-export': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
  },
};
