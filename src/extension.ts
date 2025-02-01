// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import handleShowMVCDiagram from "./showMVCDiagram";
import { sendAcceptNodeEdgeMessageToWebview } from "./messageHandler";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  const showMVCDiagram = vscode.commands.registerCommand(
    "diagrammatic.showMVCDiagram",
    async () => {
      const filePath = await vscode.window.showInputBox({
        prompt: "Enter your repository file path:",
        placeHolder: "/path/to/your/file.ts",
        ignoreFocusOut: true,
        validateInput: (text) => {
          return text.trim() ? null : "File path cannot be empty.";
        },
      });

      if (filePath) {
        vscode.window.showInformationMessage(`Parsing file path: ${filePath}`);

        try {
          currentPanel = await handleShowMVCDiagram(context, currentPanel, filePath);
          currentPanel.onDidDispose(
            () => {
              currentPanel = undefined;
            },
            null,
            context.subscriptions
          );
        } catch (error) {
          vscode.window.showErrorMessage(`Error running algorithm: ${error}`);
        }
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
}

// This method is called when your extension is deactivated
export function deactivate() {}
