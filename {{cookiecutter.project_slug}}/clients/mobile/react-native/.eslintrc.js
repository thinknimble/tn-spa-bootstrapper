export default {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  plugins: ['@tanstack/query'],
  rules: {
    'prettier/prettier': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-native/no-raw-text': 2,
    'react-native/no-unused-styles': 2,
  },
  ignorePatterns: ['tailwind.config.js', 'metro.config.js'],
}
