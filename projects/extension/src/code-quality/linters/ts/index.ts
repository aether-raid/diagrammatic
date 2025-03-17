import fs from 'fs';
import { ESLint } from 'eslint';
import * as vscode from "vscode";
import { validEnvironment } from '../../linting/checks';

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

