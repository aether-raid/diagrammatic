module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/*.integration.test.ts"],
    moduleNameMapper: {
        "^@shared/(.*)$": "<rootDir>/projects/extension/src/shared/$1",
        "^@/(.*)$": "<rootDir>/projects/extension/src/$1",
    },
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    setupFilesAfterEnv: [
        "<rootDir>/projects/extension/src/test/integrationSetup.js",
    ],
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage/integration",
    coverageReporters: ["text", "lcov"],
    collectCoverageFrom: [
        "<rootDir>/projects/extension/src/llm/*.ts",
        "<rootDir>/projects/extension/src/helpers/llm.ts",
        "<rootDir>/projects/extension/src/**/runComponentDiagram.ts",
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/",
        "/coverage/",
        ".*component.*",
        ".*vscode-test.*",
        ".*test-algortihm.*",
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/dist/",
        "/coverage/",
        "/__tests__/",
        "/test/",
    ],
};
