module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'indent': ['error', 4],
    'semi': ['error', 'always'],
    'camelcase': ['error', {
      "properties": "never",
      "ignoreDestructuring": true
    }],
    'no-useless-escape': 0
  }
}