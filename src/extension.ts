// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { Commands, WebviewCommandMessage } from "@shared/message.types";

import handleShowMVCDiagram from "./showMVCDiagram";
import { runCodeToDiagramAlgorithm } from "./runCodeToDiagramAlgorithm";
import { NodeEdgeData } from "./extension.types";
import { sendAcceptNodeEdgeMessageToWebview } from "./messageHandler";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

    const enterFilePathCommand = vscode.commands.registerCommand(
      "diagrammatic.enterFilePath",
      async () => {
        const filePath = await vscode.window.showInputBox({
          prompt: "Enter the file path:",
          placeHolder: "/path/to/your/file.ts",
          ignoreFocusOut: true,
          validateInput: (text) => {
            return text.trim() ? null : "File path cannot be empty.";
          },
        });
  
        if (filePath) {
          vscode.window.showInformationMessage(`File path entered: ${filePath}`);
  
          // handleFilePath(filePath);
        }
      }
    );
  
    context.subscriptions.push(enterFilePathCommand);

  const showMVCDiagram = vscode.commands.registerCommand(
    "diagrammatic.showMVCDiagram",
    async () => {
      currentPanel = await handleShowMVCDiagram(context, currentPanel);
      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        null,
        context.subscriptions
      );
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
