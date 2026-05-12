import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'skills/**/scripts/**', 'scripts/**']
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: {
      jsdoc: (await import('eslint-plugin-jsdoc')).default,
    },
    rules: {
      'jsdoc/require-jsdoc': ['error', {
        require: {
          FunctionDeclaration: true,
          ArrowFunctionExpression: true,
        },
        publicOnly: true
      }],
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-description': 'warn'
    }
  },
  {
    files: ['src/app/**/page.tsx', 'src/app/**/layout.tsx'],
    rules: {
      'jsdoc/require-jsdoc': 'off'
    }
  }
];

export default eslintConfig;
