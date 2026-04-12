/**
 * Standalone ESLint flat config – Vite/React (JS only, no TypeScript).
 * Deps: eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import
 */

import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

const p = plugin => (plugin?.default ? plugin.default : plugin);

const recommended = plugin =>
  plugin?.configs?.recommended?.rules ||
  plugin?.configs?.['flat/recommended']?.rules ||
  plugin?.configs?.['flat/recommended'] ||
  {};

const IGNORES = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/public/**',
  '**/.turbo/**',
  '**/*.config.*',
  '**/tailwind.config.*',
  '**/postcss.config.*',
  '**/.prettierrc.*',
  '**/*.min.js',
  '**/*.css',
  '**/*.scss',
  '**/*.sh',
  '**/tsup.config.*',
];

export default defineConfig([
  { ignores: IGNORES },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  {
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/jsx-uses-react': 'off', // Not needed with React 17+ JSX transform
      'react/prop-types': 'off', // Disabled for this project
    },
  },
  {
    name: 'import',
    files: ['**/*.{js,jsx}'],
    plugins: { import: p(importPlugin) },
    settings: {
      'import/resolver': { node: { extensions: ['.js', '.jsx'] } },
    },
    rules: {
      ...recommended(p(importPlugin)),
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
    },
  },
  {
    name: 'react-hooks',
    files: ['**/*.{jsx}'],
    plugins: { 'react-hooks': p(reactHooksPlugin) },
    rules: p(reactHooksPlugin).configs?.recommended?.rules ?? {},
  },
  {
    name: 'jsx-a11y',
    files: ['**/*.{jsx}'],
    plugins: { 'jsx-a11y': p(jsxA11yPlugin) },
    rules: recommended(p(jsxA11yPlugin)),
  },
  {
    name: 'web3',
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'parseInt', message: 'Use Number.parseInt()' },
        { name: 'parseFloat', message: 'Use Number.parseFloat()' },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: "CallExpression[callee.name='eval']", message: 'eval() is forbidden' },
      ],
    },
  },
  {
    name: 'frontend',
    files: ['**/*.{jsx,js}'],
    rules: {
      complexity: ['warn', 15],
      'import/no-anonymous-default-export': [
        'error',
        {
          allowArray: false,
          allowArrowFunction: false,
          allowAnonymousClass: false,
          allowAnonymousFunction: false,
          allowCallExpression: true,
          allowNew: false,
          allowLiteral: false,
          allowObject: false,
        },
      ],
    },
  },
  {
    name: 'prettier',
    rules: {
      indent: 'off',
      quotes: 'off',
      semi: 'off',
      'comma-dangle': 'off',
      'brace-style': 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'space-before-function-paren': 'off',
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/jsx-curly-spacing': 'off',
      'react/jsx-equals-spacing': 'off',
      'react/jsx-tag-spacing': 'off',
      'react/jsx-wrap-multilines': 'off',
    },
  },
  {
    name: 'config-files',
    files: ['**/*.config.js', '**/vite.config.*', '**/postcss.config.*'],
    rules: { 'import/no-default-export': 'off', 'no-console': 'off' },
  },
  {
    name: 'test-files',
    files: ['**/__tests__/**/*.{js,jsx}', '**/tests/**/*.{js,jsx}', '**/*.{test,spec}.{js,jsx}'],
    rules: { 'no-magic-numbers': 'off' },
  },
]);
