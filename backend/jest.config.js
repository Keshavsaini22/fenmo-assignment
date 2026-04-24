module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!@faker-js/faker)'
    ],
    clearMocks: true,
};
