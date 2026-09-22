module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@api$': '<rootDir>/src/utils/burger-api.ts',
    '^@utils-types$': '<rootDir>/src/utils/types',
    '^@slices/(.*)$': '<rootDir>/src/services/slices/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    '^.+\\.css$': 'jest-css-modules-transform',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};
