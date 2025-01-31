import * as vscode from 'vscode';
import { ESLint } from 'eslint';
import path from 'path';
import { getDiagnostics } from './helpers';
import { validEnvironment, validFile } from './checks';


export const lintActiveFile = async() => {
    const editor = vscode.window.activeTextEditor;
    const document = validFile(editor);    
    if (!document){
        return;
    }
    // Resolve the path to the eslint.config.mjs file
    const configFilePath = path.resolve(__dirname, '../eslint.config.mjs');
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!validEnvironment(configFilePath, workspacePath)){
        return;
    }

    const eslint = new ESLint({
        overrideConfigFile: configFilePath,
        cwd: workspacePath, // Set to the root of the workspace
    });
    const collection = vscode.languages.createDiagnosticCollection('diagrammatic');
    try {
        const text = document.getText();
        const results = await eslint.lintText(text, { filePath: document.fileName });
        if (results.length < 1) {
            vscode.window.showInformationMessage('No ESLint issues found.');
            return;
        }

        const result = results[0];
        collection.clear();
        const diagnostics = getDiagnostics(result.messages);
        if (diagnostics.length < 1) {
            vscode.window.showInformationMessage('No ESLint issues found.');
            return;
        }
        collection.set(document.uri , diagnostics);
        vscode.window.showWarningMessage('ESLint issues found. Check the Problems panel.');
        }
    catch (error) {
        vscode.window.showErrorMessage(`ESLint error: ${(error as Error).message}`);
    }
};