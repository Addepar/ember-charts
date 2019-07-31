module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'ember/new-module-imports': 'off',
    'ember/no-global-jquery': 'off',
    'ember/no-side-effects': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'ember/avoid-leaking-state-in-ember-objects': 'off',
    'ember/no-restricted-resolver-tests': 'off',
    'no-unused-vars': 'off',
    'no-empty': 'off'
  },
  globals: {
    'd3': 'readonly',
    '_': 'readonly',
    '$': 'readonly',
    'andThen': 'readonly',
    'fillIn': 'readonly',
    'visit': 'readonly',
    'domTriggerEvent': 'readonly',
    'assertTooltip': 'readonly',
    'currentURL': 'readonly',
    'triggerEvent': 'readonly',
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      })
    }
  ]
};
