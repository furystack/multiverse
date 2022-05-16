module.exports = {
  roots: [
    // '<rootDir>/common/components',
    // '<rootDir>/common/config',
    // '<rootDir>/common/frontend-utils',
    // '<rootDir>/common/models',
    '<rootDir>/common/service-utils',

    // '<rootDir>/frontends/core',

    // '<rootDir>/services/auth',
    // '<rootDir>/services/dashboard',
    // '<rootDir>/services/diag',
    '<rootDir>/services/media',
  ],
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**'],
  coverageReporters: ['text', 'json', 'html', 'cobertura'],
  reporters: ['default', 'jest-junit'],
}
