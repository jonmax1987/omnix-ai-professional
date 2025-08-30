import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'test-files-archive/**',
      'test-*.js',
      'playwright.config.js',
      'playwright.config.ts',
      'vite.config.js',
      'jest.config.js',
      'public/sw.js',
      'scripts/**',
      'e2e/**',
      'playwright-report/**',
      '**/*.test.{js,jsx}',
      '**/*.spec.{js,jsx}',
      '**/__tests__/**',
      'verify-*.js',
      'check-*.js',
      'clear_*.js',
      '**/*.cjs',
      'final-verification.js',
      'src/App-*.jsx'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error'
    },
  },
  {
    files: ['**/*.config.js', '**/vite.config.js', '**/playwright.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        process: true,
        __dirname: true,
        __filename: true,
        module: true,
        require: true,
        global: true
      }
    }
  }
]
