import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
    files: "out/test/**/*.test.js",
});

// advanced config
// // .vscode-test.js

// const { defineConfig } = require('@vscode/test-cli');

// module.exports = defineConfig([
//   {
//     label: 'unitTests',
//     files: 'out/test/**/*.test.js',
//     version: 'insiders',
//     workspaceFolder: './sampleWorkspace',
//     mocha: {
//       ui: 'tdd',
//       timeout: 20000
//     }
//   }
//   // you can specify additional test configurations, too
// ]);
