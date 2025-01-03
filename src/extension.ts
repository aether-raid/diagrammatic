// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { Commands, WebviewCommandMessage } from '@shared/message.types';

import handleShowMVCDiagram from './showMVCDiagram';
import { runCodeToDiagramAlgorithm } from './runCodeToDiagramAlgorithm';
import { NodeEdgeData } from './extension.types';
import { sendAcceptNodeEdgeMessageToWebview } from './messageHandler';


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

    // If webview is ready, currentPanel definitely exists, can safely assert it.
    sendAcceptNodeEdgeMessageToWebview(nodeEdgeData, currentPanel!);
  });
  context.subscriptions.push(showMVCDiagram);

  const testMsg = vscode.commands.registerCommand('diagrammatic.testMsg', () => {
    if (!currentPanel) {
      console.log("no panel available.");
      return;
    }

    sendAcceptNodeEdgeMessageToWebview({
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
    }, currentPanel);
  });
  context.subscriptions.push(testMsg);
}

// This method is called when your extension is deactivated
export function deactivate() {}
