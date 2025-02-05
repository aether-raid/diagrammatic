// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import handleShowMVCDiagram from "./showMVCDiagram";
import { sendAcceptNodeEdgeMessageToWebview } from "./messageHandler";
import { lintActiveFile } from "./code-quality/linting";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  
  const showMVCDiagram = vscode.commands.registerCommand(
    "diagrammatic.showMVCDiagram",
    async () => {
      const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,  // Only folders
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select Repository'
      });

      if (folderUri && folderUri.length > 0) {
        const filePath = folderUri[0].fsPath;

        if (filePath && filePath.length > 0) {
          vscode.window.showInformationMessage(`Parsing repository: ${filePath}`);

          try {
            currentPanel = await handleShowMVCDiagram(context, currentPanel, filePath);
            currentPanel.onDidDispose(
              () => {
                currentPanel = undefined;
              },
              null,
              context.subscriptions
            );
            vscode.window.showInformationMessage("Diagram generated!");
          } catch (error) {
            vscode.window.showErrorMessage(`Error running algorithm: ${error}`);
          }
        }
      } else {
        vscode.window.showWarningMessage('No folder selected. Please try again.');
      }
    }
  );
  context.subscriptions.push(showMVCDiagram);

  const testMsg = vscode.commands.registerCommand(
    "diagrammatic.testMsg",
    () => {
      if (!currentPanel) {
        console.log("no panel available.");
        return;
      }

      sendAcceptNodeEdgeMessageToWebview(
        {
          nodes: [
            {
              id: "1",
              type: "entity" as any,
              position: { x: 0, y: 0 },
              data: {
                entityName: "Cloud",
                entityType: 'file',
                items: [
                  { name: "fira" },
                  { name: "firaga" }
                ],
              },
            },
          ],
          edges: [],
        },
        currentPanel
      );
    }
  );
  context.subscriptions.push(testMsg);

  const code_qa = vscode.commands.registerCommand('diagrammatic.codeQa', lintActiveFile);
  context.subscriptions.push(code_qa);

}

// This method is called when your extension is deactivated
export function deactivate() {}
