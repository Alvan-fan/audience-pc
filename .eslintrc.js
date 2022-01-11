module.exports = {
    extends: [require.resolve('@umijs/fabric/dist/eslint')],
    plugins: ['simple-import-sort'],
    rules: {
        // 单引号
        quotes: ['error', 'single'],
        'no-plusplus': 'off',
        // @fixable 结尾必须有分号
        semi: [
            'error',
            'always',
            {
                omitLastInOneLineBlock: true,
            },
        ],
        // 对象字面量中冒号的前后空格
        'key-spacing': [
            'error',
            {
                beforeColon: false,
                afterColon: true,
            },
        ],
        // 关键字前后使用一致的空格
        'keyword-spacing': [
            'error',
            {
                before: true,
            },
        ],
        // 箭头函数前后空格
        'arrow-spacing': 'error',
        // 花括号中使用一致的空格
        'object-curly-spacing': ['error', 'always'],
        // 中缀操作符周围有空格
        'space-infix-ops': 'error',
        // 块之前使用一致的空格
        'space-before-blocks': 'error',
        // 多个空格
        'no-multi-spaces': 'error',
        // 逗号前后使用一致的空格
        'comma-spacing': ['error', { before: false, after: true }],
        'no-underscore-dangle': 0,
        'no-param-reassign': 'off',
        'no-whitespace-before-property': 'error',
        'space-before-function-paren': 'error',
        'max-classes-per-file': 'off',
        // 'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/type-annotation-spacing': [
            'error',
            {
                before: false,
                after: true,
                overrides: {
                    arrow: {
                        before: true,
                        after: true,
                    },
                },
            },
        ],
        // '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false,
                },
            },
        ],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'interface',
                format: ['PascalCase'],
                // "prefix": ["I"]
            },
            {
                selector: 'typeParameter',
                format: ['PascalCase'],
                // "prefix": ["T"]
            },
        ],
        'react/jsx-no-bind': 'off',
        'react/no-unused-state': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'simple-import-sort/imports': [
            2,
            {
                groups: [
                    // node 内置模块
                    [
                        '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
                    ],
                    // react 和不为 @ 以及 . 开头的
                    ['^react', '^[^@\\.]'],
                    // webpack 声明的 alias
                    ['^(@cf2e|@ant-design|@statistics)(/.*|$)'],
                    // webpack 声明的 alias
                    ['^(@)(/?.*|$)'],
                    // Side effect imports.
                    ['^\\u0000'],
                    // 父级依赖
                    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                    // 相对依赖
                    ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                    // 配置依赖
                    ['^.+\\.(config)$'],
                    // Style imports.
                    ['^.+\\.(css|scss|less)$'],
                ],
            },
        ],
    },
};
