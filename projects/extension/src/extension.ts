// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path"; // Add path import

import { handleShowMVCDiagram } from "./showMVCDiagram";
import { sendAcceptNodeEdgeMessageToWebview } from "./messageHandler";
import { GLOBALS } from "./globals";

class FolderSelectionTreeDataProvider  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {

    const selectFolderItem = new vscode.TreeItem("Select Folder", vscode.TreeItemCollapsibleState.None);
    selectFolderItem.command = {
      command: "diagrammatic.showMVCDiagram", 
      title: "Select Folder",
    };
    return [selectFolderItem];
  }
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  const treeDataProvider = new FolderSelectionTreeDataProvider ();
  vscode.window.createTreeView("select-folder-view", { treeDataProvider });

  const selectRulesetFile = vscode.commands.registerCommand(
    "diagrammatic.selectRulesetFile",
    async () => {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true, // Only files
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Select File",
      });

      if (!fileUri || fileUri.length <= 0) {
        vscode.window.showWarningMessage(
          "No file was selected. Please try again."
        );
        return;
      }

      const config = vscode.workspace.getConfiguration();
      await config.update(
        GLOBALS.ruleset.configName,
        fileUri[0].fsPath,
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        `Ruleset updated to be at '${fileUri}'!`
      );
    }
  );
  context.subscriptions.push(selectRulesetFile);

  const showMVCDiagram = vscode.commands.registerCommand(
    "diagrammatic.showMVCDiagram",
    async () => {
      const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false, // Only folders
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Repository",
      });

      if (folderUri && folderUri.length > 0) {
        const filePath = folderUri[0].fsPath;

        if (filePath && filePath.length > 0) {
          vscode.window.showInformationMessage(
            `Parsing repository: ${filePath}`
          );

          try {
            currentPanel = await handleShowMVCDiagram(
              context,
              currentPanel,
              filePath
            );
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
        vscode.window.showWarningMessage(
          "No folder selected. Please try again."
        );
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
                entityType: "file",
                items: [{ name: "fira" }, { name: "firaga" }],
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

  const testShowMVCDiagram = vscode.commands.registerCommand(
    "diagrammatic.testShowMVCDiagram",
    async (providedPath?: string) => {
      // Use provided path if available, otherwise fall back to default location
      const testRepoPath = providedPath ||
        path.join(process.cwd(), 'temp-repos', 'nestjs-realworld-example-app');

      console.log(`Test using repository at: ${testRepoPath}`);
      vscode.window.showInformationMessage(`Parsing repository: ${testRepoPath}`);

      try {
        currentPanel = await handleShowMVCDiagram(
          context,
          currentPanel,
          testRepoPath
        );
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
  );
  context.subscriptions.push(testShowMVCDiagram);
}

// This method is called when your extension is deactivated
export function deactivate() { }