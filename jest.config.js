module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.(m)?js$': '$1',
  },
  testPathIgnorePatterns: [
    'dist',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '!dist/',
    '!__tests__/db.ts',
    '!src/**/*.d.ts',
    'src/**/*.{ts,tsx,js,jsx}',
  ],
};
