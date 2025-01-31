import * as vscode from 'vscode';
import { ESLint } from 'eslint';
import path from 'path';
import { existsSync } from 'fs';


export const lintActiveFile = async() => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const document = editor.document;
    if (document.languageId !== 'typescript') {
      vscode.window.showErrorMessage('This command only works for TypeScript files.');
      return;
    }

    
    const text = document.getText();
    // // Resolve the path to the eslint.config.mjs file
    const configFilePath = path.resolve(__dirname, '../eslint.config.mjs');
    // Check if the file exists
    if (!existsSync(configFilePath)) {
        vscode.window.showErrorMessage(`ESLint config file not found at: ${configFilePath}`);
        return;
    }
    
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspacePath) {
        console.error("No workspace folder is open.");
    }
    
    const eslint = new ESLint({
        overrideConfigFile: configFilePath,
        cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath, // Set to the root of the workspace
    });
    try {
        const results = await eslint.lintText(text, { filePath: document.fileName });
        if (results.length > 0) {
            const result = results[0];
            if (result.messages.length > 0) {
                const diagnostics: vscode.Diagnostic[] = [];
                const collection = vscode.languages.createDiagnosticCollection('eslint');
                
                result.messages.forEach((msg) => {
                  const range = new vscode.Range(
                  msg.line - 1,
                  msg.column - 1,
                  msg.endLine ? msg.endLine - 1 : msg.line - 1,
                  msg.endColumn ? msg.endColumn - 1 : msg.column
                  );
                  const diagnostic = new vscode.Diagnostic(
                  range,
                  msg.message,
                  msg.severity === 2
                      ? vscode.DiagnosticSeverity.Error
                      : vscode.DiagnosticSeverity.Warning
                  );
                  diagnostics.push(diagnostic);
            });
  
            collection.set(document.uri, diagnostics);
            vscode.window.showWarningMessage('ESLint issues found. Check the Problems panel.');
          } else {
            vscode.window.showInformationMessage('No ESLint issues found.');
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`ESLint error: ${(error as Error).message}`);
      }
};