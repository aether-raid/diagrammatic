import type { CppLintResult } from './definitions';
import fs from 'fs';
import { spawn } from 'child_process';
import { validEnvironment } from '../linting/checks';
import * as vscode from "vscode";
import { ESLint } from 'eslint';
import { processCpplintOutput } from '../linting/helpers';


export const lintFile = (linter: string, filePath: string, configFilePath:string): Promise<ESLint.LintResult[] | CppLintResult[]> | []=>  {
    switch (linter) {
        case 'eslint':
        case 'tslint':
            return lintFileES(filePath, configFilePath);
        case 'cpplint':
            return lintFileCpp(filePath, configFilePath).then((output) => processCpplintOutput(output));
        default:
            break;
    }
    return [];
}

export const lintFileES = (filePath:string, configFilePath:string): Promise<ESLint.LintResult[]> | [] => {
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!validEnvironment(configFilePath, workspacePath)){
        return [];
    }

    const eslint = new ESLint({
        overrideConfigFile: configFilePath,
        cwd: workspacePath, // Set to the root of the workspace
    });
    const sourceCode = fs.readFileSync(filePath, "utf-8");
    return eslint.lintText(sourceCode, { filePath: filePath });
}

export const lintFileCpp = (filePath:string, configFilePath:string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const extension = vscode.extensions.getExtension('diagrammatic.diagrammatic')!;
        const scriptPath = `${extension.extensionPath}\\config\\linting-configs\\cpplint.py`
        let output = "";
        const pythonProcess = spawn("python", [scriptPath, filePath], { shell: true })
        pythonProcess.stderr.on("data", (data) => {
            output += data.toString()
        });
        pythonProcess.stderr.on("end", () => {
            resolve(output)
        })
    })
}

// const projectRoot = 'c:/Users/bruce/SMU-work/y3/fyp/models/datasets/codebases/juice-shop-goof'; // Adjust as needed
// process.chdir(projectRoot);  // Change working directory to project root
// console.log('Current working directory:', process.cwd());
// console.log('config:', configFilePath);
// console.log('File to lint:', filePath);

// return new Promise((resolve, reject) => {
//     exec(`npx ${linter} ${filePath.replace(/\\/g, '/')} --format json --config ${configFilePath.replace(/\\/g, '/')}`
//         , (error, stdout, stderr) => {
//     // if (error) {
//     //     console.error(`Linting error:`, error);
//     //     console.error(`Linting stderr:`, stderr);
//     //     reject(stderr || error.message);
//     // } else {
//             resolve(JSON.parse(stdout) as LintResult[]);
//         // }
//     });
// });