import * as vscode from 'vscode';
import path from 'path';
import { getDiagnostics } from './helpers';
import { validEnvironment, validFile } from './checks';
import { lintFile } from '../linters';

export const getDiagnosticsFromFile = async(linter:string, filePath:string): Promise<{[key:string]: vscode.Diagnostic[]}> => {
    const document = await vscode.workspace.openTextDocument(filePath);
    if (!document){
        return {};
    }

    // Resolve the path to the eslint.config.mjs file
    const configFilePath = path.resolve(__dirname, '../linting-configs/eslint.config.mjs');
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!validEnvironment(configFilePath, workspacePath)){
        return {};
    }

    const collection = vscode.languages.createDiagnosticCollection('diagrammatic');
    try {
// TODO: MODIFY THIS TO USE CMD TO LINT FILE
        const results = await lintFile(linter, filePath);
        if (results.length < 1) {
            return {};
        }
        const result = results[0];
        collection.clear();
        const diagnostics = getDiagnostics(result.messages);
        if (diagnostics.length < 1) {
            return {};
        }
        collection.set(document.uri , diagnostics);
        return {diagnostics: diagnostics};
    } catch (error) {
        vscode.window.showErrorMessage(`ESLint error: ${(error as Error).message}`);
        return {};
    }
};


// export const lintActiveFile = async() => {
    //     const editor = vscode.window.activeTextEditor;
    //     const document = validFile(editor);    
    //     if (!document){
    //         return;
    //     }
    //     // Resolve the path to the eslint.config.mjs file
    //     const configFilePath = path.resolve(__dirname, '../eslint.config.mjs');
    //     const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    //     if (!validEnvironment(configFilePath, workspacePath)){
    //         return;
    //     }
    
    //     const eslint = new ESLint({
    //         overrideConfigFile: configFilePath,
    //         cwd: workspacePath, // Set to the root of the workspace
    //     });
    //     const collection = vscode.languages.createDiagnosticCollection('diagrammatic');
    //     try {
    //         const text = document.getText();
    //         const results = await eslint.lintText(text, { filePath: document.fileName });
    //         if (results.length < 1) {
    //             vscode.window.showInformationMessage('No ESLint issues found.');
    //             return;
    //         }
    
    //         const result = results[0];
    //         collection.clear();
    //         const diagnostics = getDiagnostics(result.messages);
    //         if (diagnostics.length < 1) {
    //             vscode.window.showInformationMessage('No ESLint issues found.');
    //             return;
    //         }
    //         collection.set(document.uri , diagnostics);
    //         vscode.window.showWarningMessage('ESLint issues found. Check the Problems panel.');
    //         }
    //     catch (error) {
    //         vscode.window.showErrorMessage(`ESLint error: ${(error as Error).message}`);
    //     }
    // };