import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default [
    {
        ignores: ['node_modules/**', 'js/fff.js']
    },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2018,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly'
            }
        },
        plugins: {
            '@stylistic': stylistic
        },
        rules: {
            '@stylistic/indent': ['error', 4],
            '@stylistic/semi': ['error', 'always'],
            camelcase: ['error', {
                properties: 'never',
                ignoreDestructuring: true
            }],
            'no-useless-escape': 'off'
        }
    },
    {
        files: ['js/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.browser, ...globals.worker }
        }
    },
    {
        files: ['tests/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: globals.node
        }
    }
];
