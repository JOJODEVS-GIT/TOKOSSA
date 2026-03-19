const nextJest = require('next/jest')

/** Configuration Jest pour Next.js 14 App Router */
const createJestConfig = nextJest({
  // Chemin vers l'application Next.js pour charger next.config.js et .env
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  // Environnement de test pour les composants React
  testEnvironment: 'jsdom',

  // Setup : importer jest-dom pour les matchers supplementaires (toBeInTheDocument, etc.)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Alias de chemin (@/) pour correspondre a tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Dossiers de tests
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.tsx',
  ],

  // Couverture de code
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/api/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(config)
