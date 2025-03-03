import { ESLint } from 'eslint';
import type { LintResult, SupportedLanguages } from './definitions';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import * as vscode from 'vscode';


export const hasLinter = (workspacePath: string, ext: keyof typeof SupportedLanguages) => {
    const packageJsonPath = path.join(workspacePath, 'package.json');
    console.log("packageJsonPath: ", packageJsonPath);
    if (!fs.existsSync(packageJsonPath)) {
        return false;
    }
    return true;
}

// function isLinterInstalled(linter: string): Promise<boolean> {
//     return new Promise((resolve) => {
//         exec(`${linter} --version`, (error) => {
//             resolve(!error);
//         });
//     });
// }

// async function ensureLinterInstalled(linter: string, installCommand: string) {
//     const installed = await isLinterInstalled(linter);
//     if (!installed) {
//         const choice = await vscode.window.showWarningMessage(
//             `${linter} is not installed. Would you like to install it?`,
//             'Yes',
//             'No'
//         );
//         if (choice === 'Yes') {
//             exec(installCommand, (error, stdout, stderr) => {
//                 if (error) {
//                     vscode.window.showErrorMessage(`Failed to install ${linter}: ${stderr}`);
//                 } else {
//                     vscode.window.showInformationMessage(`${linter} installed successfully.`);
//                 }
//             });
//         }
//     }
// }


export const lintFile = (linter: string, filePath: string): Promise<LintResult[]> =>  {
    const configFilePath = path.resolve(__dirname, '../linting-configs/eslint.config.mjs');
    
    const projectRoot = 'c:/Users/bruce/SMU-work/y3/fyp/models/datasets/codebases/juice-shop-goof'; // Adjust as needed
    process.chdir(projectRoot);  // Change working directory to project root
    console.log('Current working directory:', process.cwd());
    console.log('File to lint:', filePath);
    console.log('Path of config file:', configFilePath);
    
    // succeeds
    // npx eslint c:/Users/bruce/SMU-work/y3/fyp/models/datasets/codebases/juice-shop-goof/routes/b2bOrder.ts --format json --config c:/Users/bruce/SMU-work/y3/fyp/diagrammatic/linting-configs/eslint.config.mjs
    // fails
    // npx eslint c:/Users/bruce/SMU-work/y3/fyp/models/datasets/codebases/juice-shop-goof/routes/order.ts --format json --config c:/Users/bruce/SMU-work/y3/fyp/diagrammatic/linting-configs/eslint.config.mjs
    return new Promise((resolve, reject) => {
        exec(`npx eslint ${filePath.replace(/\\/g, '/')} --format json --config ${configFilePath.replace(/\\/g, '/')}`
            , (error, stdout, stderr) => {
        // if (error) {
        //     console.error(`Linting error:`, error);
        //     console.error(`Linting stderr:`, stderr);
        //     reject(stderr || error.message);
        // } else {
                resolve(JSON.parse(stdout) as LintResult[]);
            // }
        });
    });
}


// export const checkLinterDependencies = (): boolean => {



//     const packageJson = require(packageJsonPath);

//     // Required ESLint package
//     const requiredPackages = ['eslint'];
    
//     // Check if ESLint is in dependencies or devDependencies
//     const devDependencies = packageJson.devDependencies || {};
//     const dependencies = packageJson.dependencies || {};

//     // Ensure that ESLint and plugins are installed
//     const isESLintInstalled = devDependencies['eslint'] || dependencies['eslint'];
    
//     if (!isESLintInstalled) {
//         console.error("ESLint is not installed in your project.");
//         return false;
//     }

//     // Check if ESLint plugins or configs are installed (based on your config)
//     // Example: If you're using eslint-plugin-react, eslint-config-airbnb, etc.
//     const eslintPlugins = ['eslint-plugin-react', 'eslint-config-airbnb']; // Add any plugins you're using here
//     let allPluginsInstalled = true;

//     eslintPlugins.forEach(plugin => {
//         if (!devDependencies[plugin] && !dependencies[plugin]) {
//             console.error(`${plugin} is missing from dependencies or devDependencies.`);
//             allPluginsInstalled = false;
//         }
//     });

//     return allPluginsInstalled;
// };

// import { exec } from 'child_process';

// function checkIfPipxInstalled(): Promise<boolean> {
//     return new Promise((resolve, reject) => {
//         exec('pipx --version', (error, stdout, stderr) => {
//             if (error) {
//                 resolve(false); // pipx is not installed
//             } else {
//                 resolve(true); // pipx is installed
//             }
//         });
//     });
// }

// import * as vscode from 'vscode';

// function promptToInstallPipx(): Promise<boolean> {
//     return new Promise((resolve) => {
//         vscode.window.showInformationMessage(
//             'Your VS Code extension requires pipx to be installed. Do you want to install it?',
//             'Install pipx', 'Cancel'
//         ).then(selection => {
//             if (selection === 'Install pipx') {
//                 resolve(true);
//             } else {
//                 resolve(false);
//             }
//         });
//     });
// }

// function installPipx(): Promise<void> {
//     return new Promise((resolve, reject) => {
//         exec('pip install pipx', (error, stdout, stderr) => {
//             if (error) {
//                 vscode.window.showErrorMessage(`Failed to install pipx: ${stderr}`);
//                 reject(error);
//             } else {
//                 vscode.window.showInformationMessage('pipx installed successfully!');
//                 resolve();
//             }
//         });
//     });
// }

// function installPipxPlatformSpecific(): Promise<void> {
//     const platform = process.platform;

//     let installCommand = '';
//     if (platform === 'win32') {
//         installCommand = 'choco install pipx';
//     } else if (platform === 'darwin' || platform === 'linux') {
//         installCommand = 'pip install pipx';
//     } else {
//         return Promise.reject(new Error('Unsupported platform'));
//     }

//     return new Promise((resolve, reject) => {
//         exec(installCommand, (error, stdout, stderr) => {
//             if (error) {
//                 vscode.window.showErrorMessage(`Failed to install pipx: ${stderr}`);
//                 reject(error);
//             } else {
//                 vscode.window.showInformationMessage('pipx installed successfully!');
//                 resolve();
//             }
//         });
//     });
// }

// import * as vscode from 'vscode';
// import { exec } from 'child_process';

// async function ensurePipxInstalled() {
//     const pipxInstalled = await checkIfPipxInstalled();

//     if (!pipxInstalled) {
//         const userWantsToInstall = await promptToInstallPipx();

//         if (userWantsToInstall) {
//             try {
//                 await installPipxPlatformSpecific();
//                 // Proceed with the logic that requires pipx
//             } catch (error) {
//                 vscode.window.showErrorMessage('Failed to install pipx. Please install it manually.');
//             }
//         } else {
//             vscode.window.showWarningMessage('You need pipx installed for this extension to work.');
//         }
//     } else {
//         // Proceed with the logic that requires pipx
//     }
// }
