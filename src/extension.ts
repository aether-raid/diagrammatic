// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { Commands, WebviewCommandMessage } from '@shared/message.types';

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
    let nodeEdgeData: NodeEdgeData = runCodeToDiagramAlgorithm();

    waitWebviewReady = new Promise((resolve) => {
      currentPanel = handleShowMVCDiagram(context, currentPanel);
      currentPanel.onDidDispose(
        () => { currentPanel = undefined },
        null,
        context.subscriptions
      );

      currentPanel.webview.onDidReceiveMessage((message: WebviewCommandMessage) => {
        switch (message.command) {
          case Commands.READY:
            webviewIsReady = true;
            resolve();
        };
      });
    });

    // Wait for webview to setup listeners (ready) before sending data over
    if (!webviewIsReady) {
      await waitWebviewReady;
    }

    const message: WebviewCommandMessage = {
      command: Commands.ACCEPT_NODE_EDGE_DATA,
      message: nodeEdgeData,
    }
    currentPanel!.webview.postMessage(message);
  });
  context.subscriptions.push(showMVCDiagram);

  const testMsg = vscode.commands.registerCommand('diagrammatic.testMsg', () => {
    if (!currentPanel) {
      console.log("no panel available.");
      return;
    }

    const message: WebviewCommandMessage = {
      command: Commands.ACCEPT_NODE_EDGE_DATA,
      message: {
        nodes: [{
          id: '1',
          type: 'file',
          position: { x:0, y:0 },
          data: {
            fileName: 'Cloud',
            entities: [
              'fira',
              'firaga'
            ]
          }
        }],
        edges: []
      }
    }
    currentPanel.webview.postMessage(message);
  });
  context.subscriptions.push(testMsg);
}

// This method is called when your extension is deactivated
export function deactivate() {}
