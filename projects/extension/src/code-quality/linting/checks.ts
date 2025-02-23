import { existsSync } from 'fs';
import * as vscode from 'vscode';

export const validEnvironment = (configFilePath:string, workspacePath:string|undefined) => {
    if (!existsSync(configFilePath)) {
            vscode.window.showErrorMessage(`ESLint config file not found at: ${configFilePath}`);
            return false;
        }
        
    if (!workspacePath) {
        vscode.window.showErrorMessage(`No workspace folder is open`);
        return false;
    }

    return true;
};

export const validFile = (editor: vscode.TextEditor | undefined): vscode.TextDocument | null => {
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return null;
    }
    const document = editor.document;    

    if (document.languageId !== 'typescript') {
        vscode.window.showErrorMessage('This command only works for TypeScript files.');
        return null;
    }
    return document;
}