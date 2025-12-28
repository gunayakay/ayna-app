module.exports = {
  root: true,
  extends: [
    '@react-native',
    'prettier',
    'plugin:@dword-design/import-alias/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  settings: {
    react: {
      version: 'detect', // automatically detect the React version
    },
    'import/ignore': ['node_modules/react-native/index\\.js$'],
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src'],
      },
      alias: {
        map: [
          ['#', './src'],
          ['#business', './src/features/business'],
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true,
      tsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
    '@dword-design/import-alias/prefer-alias': [
      'error',
      {
        alias: {
          '#': './src',
        },
      },
    ],
    // this is for sorting imports
    'import/order': [
      'error',
      {
        groups: [['external', 'builtin'], 'internal', ['sibling', 'parent'], 'index'],
        pathGroups: [
          {
            pattern: '@(react|react-native)',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@src/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['internal', 'react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/forbid-prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'no-useless-escape': 'off',
    'no-case-declarations': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/prop-types': 'off',
    radix: 'off',
  },
  overrides: [
    {
      files: ['src/features/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'import/no-unresolved': 'off',
        'import/no-absolute-path': 'off',
        '@dword-design/import-alias/prefer-alias': 'off',
      },
    },
  ],
};
