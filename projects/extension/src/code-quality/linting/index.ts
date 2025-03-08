import * as vscode from 'vscode';
import path from 'path';
import { getDiagnostics } from './helpers';
import { validEnvironment, validFile } from './checks';
import { lintFile } from '../linters';
import { Linters } from '../linters/definitions';

export const getDiagnosticsFromFile = async(linter:typeof Linters[keyof typeof Linters], filePath:string, configFilePath:string): Promise<{[key:string]: vscode.Diagnostic[]}> => {
    const document = await vscode.workspace.openTextDocument(filePath);
    if (!document){
        return {};
    }
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!validEnvironment(configFilePath, workspacePath)){
        return {};
    }

    const collection = vscode.languages.createDiagnosticCollection('diagrammatic');
    try {
        const results = await lintFile(linter, filePath, configFilePath);
        if (results.length < 1) {
            return {};
        }
        const result = results[0];
        collection.clear();
        const diagnostics = getDiagnostics(result.messages);
        console.log("diagnostics:", diagnostics);
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