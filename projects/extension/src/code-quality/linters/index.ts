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
        try{
            const extension = vscode.extensions.getExtension('diagrammatic.diagrammatic')!;
            const linterPath = `${extension.extensionPath}\\config\\linters\\cpplint.exe`
            let output = "";
            const pythonProcess = spawn(linterPath, [filePath])
            pythonProcess.stderr.on("data", (data) => {
                output += data.toString()
            });
            pythonProcess.stderr.on("end", () => {
                resolve(output)
            })
        }catch(error){
            if (error instanceof Error){
                reject("Error running cpplint, error: " + error.message);
                vscode.window.showErrorMessage(`Error running cpplint: ${error.message}`);
            }
            console.error(error);
        }
    })
}
