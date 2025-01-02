// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import handleShowMVCDiagram from './showMVCDiagram';
import { runCodeToDiagramAlgorithm } from './runCodeToDiagramAlgorithm';
import { NodeEdgeData } from './extension.types';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  let webviewIsReady: boolean = false;
  let waitWebviewReady: Promise<void>;

  const showMVCDiagram = vscode.commands.registerCommand('diagrammatic.showMVCDiagram', async () => {
    let nodeEdgeData: NodeEdgeData | undefined = undefined;

    waitWebviewReady = new Promise((resolve) => {
      currentPanel = handleShowMVCDiagram(context, currentPanel);
      currentPanel.onDidDispose(
        () => { currentPanel = undefined },
        null,
        context.subscriptions
      );

      nodeEdgeData = runCodeToDiagramAlgorithm();
      currentPanel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case 'ready':
            webviewIsReady = true;
            resolve();
        };
      });
    });

    // Wait for webview to setup listeners (ready) before sending data over
    if (!webviewIsReady) {
      await waitWebviewReady;
    }

    currentPanel!.webview.postMessage({
      command: 'accept-node-edge-data',
      message: nodeEdgeData
    });
  });

  context.subscriptions.push(showMVCDiagram);
}

// This method is called when your extension is deactivated
export function deactivate() {}
