module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    'no-console': process.env.NODE_ENV ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV ? 'warn' : 'off',
    'no-unused-vars': process.env.NODE_ENV ? 'warn' : 'off',
    'vue/no-unused-components': process.env.NODE_ENV ? 'warn' : 'off',
    'vue/no-v-model-argument': process.env.NODE_ENV ? 'warn' : 'off',
    'vue/multi-word-component-names': process.env.NODE_ENV ? 'warn' : 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prettier/prettier': 'error',
  },
}
