import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // fixtures는 위반을 일부러 담은 검사 재료다.
  { ignores: ['dist', 'coverage', 'reports', 'fixtures'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'no-nested-ternary': 'error',
      // 없음을 적을 때는 null이다. undefined는 엔진이 돌려준 것을 견줄 때만 쓴다.
      'no-restricted-syntax': [
        'error',
        {
          selector: "Identifier[name='undefined']:not(BinaryExpression > Identifier)",
          message: '없음은 null로 적는다. undefined는 엔진이 돌려준 값을 견줄 때만 쓴다.',
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  prettier,
)
