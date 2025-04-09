module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: [
        "<rootDir>/projects/webview-ui/src/test/setupTests.ts",
    ],
    moduleNameMapper: {
        "^@shared/(.*)$": "<rootDir>/projects/webview-ui/src/test/shared/$1",
        // Add any other path mappings your app uses
    },
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: ".*component\\.test\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
    transformIgnorePatterns: ["/node_modules/*"],
};
