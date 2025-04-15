import { ESLint } from 'eslint';
import * as vscode from "vscode";
import * as path from "path";

const extension = vscode.extensions.getExtension('diagrammatic.diagrammatic')!;
const configFilePath = path.join(extension.extensionPath, 'config', 'linting-configs', 'eslint.config.mjs');


export const lintFileES = (filePath:string, cwd:string): Promise<ESLint.LintResult[]> | [] => {
    const eslint = new ESLint({
        overrideConfigFile: configFilePath,
        cwd: cwd, // Set to the root of the workspace
    });
    return eslint.lintFiles([filePath]);
}

