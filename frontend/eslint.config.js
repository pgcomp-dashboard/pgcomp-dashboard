import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import stylisticJs from '@stylistic/eslint-plugin-js';
import stylisticJsx from '@stylistic/eslint-plugin-jsx';

export default tseslint.config(
  { ignores: [ 'dist', ], },
  {
    extends: [ js.configs.recommended, ...tseslint.configs.recommended, ],
    files: [ '**/*.{ts,tsx}', './eslint.config.js', './vite.config.ts', ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic/ts': stylisticTs,
      '@stylistic/js': stylisticJs,
      '@stylistic/jsx': stylisticJsx,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, },
      ],
      '@stylistic/ts/indent': [ 'error', 2, ],
      '@stylistic/ts/quotes': [ 'error', 'single', ],
      '@stylistic/ts/semi': [ 'error', 'always', ],
      '@stylistic/js/arrow-spacing': [ 'error', { before: true, after: true, }, ],
      '@stylistic/js/array-bracket-spacing': [ 'error', 'always', ],
      '@stylistic/ts/object-curly-spacing': [ 'error', 'always', ],
      '@stylistic/ts/comma-dangle': [ 'error', 'always', ],
      '@stylistic/ts/block-spacing': [ 'error', 'always', ],
      '@stylistic/ts/brace-style': [ 'error', '1tbs', ],
      '@stylistic/jsx/jsx-indent': [ 'error', 2, ],
    },
  },
);
