import * as vscode from "vscode";
import { TaskQueue, QueueError } from 'ts-async-queue';
import { Commands, JumpToLinePayload, WebviewCommandMessage } from "@shared/message.types";

import { runCodeToDiagramAlgorithm } from "./runCodeToDiagramAlgorithm";
import { NodeEdgeData } from "./extension.types";
import { sendAcceptNodeEdgeMessageToWebview } from "./messageHandler";
import { runNodeDescriptionsAlgorithm } from "./runNodeDescriptionsAlgorithm";
import { getComponentDiagram } from "./runComponentDiagramAlgorithm";

const handleShowMVCDiagram = async (
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel | undefined,
  filePath: string
): Promise<vscode.WebviewPanel> => {
  if (panel) {
    panel.reveal();
    return Promise.resolve(panel);
  }

  let nodeEdgeData: NodeEdgeData = runCodeToDiagramAlgorithm(filePath);
  nodeEdgeData.nodes = await runNodeDescriptionsAlgorithm(nodeEdgeData.nodes);
  const componentNodeEdge = await getComponentDiagram(nodeEdgeData)

  panel = setupWebviewPanel(context);
  const waitWebviewReady: Promise<void> = new Promise((resolve) => {
    panel.webview.onDidReceiveMessage(async (message: WebviewCommandMessage) => {
      switch (message.command) {
        case Commands.READY:
          resolve();
          break;
        case Commands.JUMP_TO_LINE:
          const msg = message.message as JumpToLinePayload;
          const fileUri = vscode.Uri.file(msg.filePath);
          const position = new vscode.Position(msg.lineNumber-1, 0);
          await vscode.commands.executeCommand('vscode.open', fileUri, {
            selection: new vscode.Range(position, position),
          });
          break;
      }
    });
  });

  await waitWebviewReady;
  sendAcceptNodeEdgeMessageToWebview(nodeEdgeData, panel);
  return Promise.resolve(panel);
};

const setupWebviewPanel = (context: vscode.ExtensionContext) => {
  const panel = vscode.window.createWebviewPanel(
    "diagrammatic",
    "MVC Diagram",
    vscode.ViewColumn.One,
    {
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = getWebViewContent(context, panel);
  return panel;
};

const getWebViewContent = (
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel
) => {
  const webviewPath = vscode.Uri.joinPath(
    context.extensionUri,
    "dist",
    "webview"
  );

  const cssPath = vscode.Uri.joinPath(webviewPath, "assets", "webview.css");
  const scriptPath = vscode.Uri.joinPath(webviewPath, "webview.js");

  const cssSrc = panel.webview.asWebviewUri(cssPath);
  const scriptSrc = panel.webview.asWebviewUri(scriptPath);

  return `
    <!doctype html>
    <html lang="en">
    <head>
      <link rel="stylesheet" href=${cssSrc}>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
      <div id="root"></div>
      <script src=${scriptSrc}></script>
    </body>
    </html>
  `;
};

export default handleShowMVCDiagram;
