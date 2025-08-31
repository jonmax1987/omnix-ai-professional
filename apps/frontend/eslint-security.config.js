import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * OMNIX AI - Security-focused ESLint Configuration
 * This configuration focuses on security-related linting rules
 */
export default [
  {
    ignores: [
      'dist',
      'node_modules',
      '*.config.js',
      '*.config.ts',
      'coverage',
      'playwright-report',
      'test-results'
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        WebSocket: 'readonly',
        EventSource: 'readonly',
        crypto: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly'
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // Security-focused rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-unsafe-innerhtml': 'off', // Custom rule for React
      
      // Console and debugging
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-alert': 'warn',
      
      // Potential security vulnerabilities
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
      'no-new-wrappers': 'error',
      'no-object-constructor': 'error',
      
      // Variables and scoping
      'no-undef': 'error',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-use-before-define': ['error', { 
        functions: false,
        classes: true,
        variables: true
      }],
      
      // Best practices for security
      'eqeqeq': ['error', 'always'],
      'no-eq-null': 'error',
      'no-new': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-throw-literal': 'error',
      'no-void': 'error',
      'radix': 'error',
      'yoda': 'error',
      
      // React security
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Custom security rules
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.type='Identifier'][callee.name='eval']",
          message: 'eval() is dangerous and should not be used'
        },
        {
          selector: "MemberExpression[property.name='innerHTML']",
          message: 'innerHTML can be dangerous. Use textContent or proper React rendering instead'
        },
        {
          selector: "MemberExpression[property.name='outerHTML']",
          message: 'outerHTML can be dangerous. Use proper React rendering instead'
        },
        {
          selector: "CallExpression[callee.type='Identifier'][callee.name='setTimeout'][arguments.0.type='Literal']",
          message: 'setTimeout with string argument can be dangerous. Use function instead'
        },
        {
          selector: "CallExpression[callee.type='Identifier'][callee.name='setInterval'][arguments.0.type='Literal']",
          message: 'setInterval with string argument can be dangerous. Use function instead'
        }
      ],
      
      // Restrict dangerous globals and APIs
      'no-restricted-globals': [
        'error',
        {
          name: 'event',
          message: 'Use explicit parameter instead of global event'
        },
        {
          name: 'fdescribe',
          message: 'Do not commit fdescribe. Use describe instead'
        },
        {
          name: 'fit',
          message: 'Do not commit fit. Use it instead'
        }
      ],
      
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'eval',
          message: 'window.eval is dangerous and should not be used'
        },
        {
          object: 'global',
          property: 'eval',
          message: 'global.eval is dangerous and should not be used'
        },
        {
          object: 'document',
          property: 'write',
          message: 'document.write is dangerous and should not be used'
        },
        {
          object: 'document',
          property: 'writeln',
          message: 'document.writeln is dangerous and should not be used'
        }
      ],
      
      // Environment-specific rules
      ...(process.env.NODE_ENV === 'production' && {
        'no-console': 'error',
        'no-debugger': 'error',
        'no-warning-comments': ['warn', {
          terms: ['TODO', 'FIXME', 'BUG'],
          location: 'start'
        }]
      }),
      
      // React-specific security rules
      'no-danger': 'error', // This would need to be added as a custom rule for React
      
      // Import security
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../**/node_modules/**'],
              message: 'Direct node_modules imports are not allowed'
            }
          ]
        }
      ]
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
  {
    files: ['**/*.config.{js,ts}', '**/vite.config.{js,ts}'],
    rules: {
      'no-console': 'off',
    },
  }
];