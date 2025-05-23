import * as vscode from "vscode";

import { Feature, FeatureStatus, NodeEdgeData } from "@shared/app.types";
import {
  Commands,
  GenerateFnDescriptionPayload,
  JumpToLinePayload,
  WebviewCommandMessage,
} from "@shared/message.types";

import { runCodeToDiagramAlgorithm } from "./codeToDiagram/runCodeToDiagramAlgorithm";
import { runCodeLinting } from "./codeQuality/runCodeLinting";
import { getComponentDiagram } from "./componentDiagram/runComponentDiagramAlgorithm";
import { getFunctionDescriptions } from "./functionDescriptions/runFunctionDescriptionsAlgorithm";
import {
  sendAcceptNodeEdgeMessageToWebview,
  sendAcceptCompNodeEdgeMessageToWebview,
  sendUpdateFeatureStatusMessageToWebview,
  sendAcceptFnDescriptionMessageToWebview,
  sendAcceptNodeDescriptionsMessageToWebview,
} from "./messageHandler";
import { runNodeDescriptionsAlgorithm } from "./nodeDescriptions/runNodeDescriptionsAlgorithm";
import { retrieveApiKey } from "./helpers/apiKey";
import { LLMProvider, retrieveLLMProvider } from "./helpers/llm";

export const handleShowMVCDiagram = async (
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel | undefined,
  filePath: string
): Promise<vscode.WebviewPanel> => {
  if (panel) {
    panel.reveal();
    return Promise.resolve(panel);
  }

  // Tree-sitter Structure & LLM Descriptions
  let nodeEdgeData: NodeEdgeData = runCodeToDiagramAlgorithm(filePath);
  let componentNodeEdgeData: NodeEdgeData | undefined;

  // Linting & security
  const { lintedNodes, hasIssues } = await runCodeLinting(nodeEdgeData.nodes, filePath);
  nodeEdgeData.nodes = lintedNodes;
  if (hasIssues) {
    vscode.window.showWarningMessage(
      "Linting issues found. Check the Problems panel."
    );
  }

  panel = setupWebviewPanel(context);

  const waitWebviewReady: Promise<void> = new Promise((resolve) => {
    panel.webview.onDidReceiveMessage(
      async (message: WebviewCommandMessage) => {
        switch (message.command) {
          case Commands.READY: {
            sendAcceptNodeEdgeMessageToWebview(nodeEdgeData, panel);
            sendAcceptCompNodeEdgeMessageToWebview(componentNodeEdgeData, panel);
            resolve();
            break;
          }

          case Commands.JUMP_TO_LINE: {
            const msg = message.message as JumpToLinePayload;
            const fileUri = vscode.Uri.file(msg.filePath);
            const position = new vscode.Position(msg.lineNumber, 0);
            await vscode.commands.executeCommand("vscode.open", fileUri, {
              selection: new vscode.Range(position, position),
            });
            break;
          }

          case Commands.GENERATE_FN_DESCRIPTIONS: {
            const msg = message.message as GenerateFnDescriptionPayload;
            await getFunctionDescriptionsAsync(msg.nodeId);
            break;
          }

          case Commands.GET_COMPONENT_DIAGRAM: {
            await getComponentDiagramAsync(); // Call the regeneration function
            break;
          }
        }
      }
    );
  });

  await waitWebviewReady;

  // LLM features, run as background tasks
  const apiKey = retrieveApiKey();
  if (!apiKey) {
    // Node Description & Component Diagram will not be ran without API key
    vscode.window.showInformationMessage(
      "The component diagram & node descriptions are disabled (No API key provided)"
    );
    return Promise.resolve(panel);
  }

  const llmProvider: LLMProvider = retrieveLLMProvider(apiKey);
  const getComponentDiagramAsync = async () => {
    console.log("running component diag");

    sendUpdateFeatureStatusMessageToWebview({
      feature: Feature.COMPONENT_DIAGRAM,
      status: FeatureStatus.ENABLED_LOADING,
    }, panel);
    const data = await getComponentDiagram(nodeEdgeData, llmProvider);
    componentNodeEdgeData = data;

    sendAcceptCompNodeEdgeMessageToWebview(componentNodeEdgeData, panel);
    sendUpdateFeatureStatusMessageToWebview({
      feature: Feature.COMPONENT_DIAGRAM,
      status: FeatureStatus.ENABLED_DONE,
    }, panel);
    console.log("component diag done & sent");
  }

  const getNodeDescriptionsAsync = async () => {
    console.log("running node desc");
    sendUpdateFeatureStatusMessageToWebview({
      feature: Feature.NODE_DESCRIPTIONS,
      status: FeatureStatus.ENABLED_LOADING,
    }, panel);

    const data = await runNodeDescriptionsAlgorithm(nodeEdgeData.nodes, nodeEdgeData, llmProvider);
    nodeEdgeData.nodes = data;

    sendAcceptNodeDescriptionsMessageToWebview(nodeEdgeData, panel);
    sendUpdateFeatureStatusMessageToWebview({
      feature: Feature.NODE_DESCRIPTIONS,
      status: FeatureStatus.ENABLED_DONE,
    }, panel);
    console.log("node desc done & sent");
  }

  const getFunctionDescriptionsAsync = async (targetNodeId: string) => {
    console.log("running function desc")

    const fnDesc = await getFunctionDescriptions(llmProvider, nodeEdgeData, targetNodeId);
    sendAcceptFnDescriptionMessageToWebview({
      nodeId: targetNodeId,
      data: fnDesc ?? [],
    }, panel);
    console.log("done function desc")
  }

  getComponentDiagramAsync();
  getNodeDescriptionsAsync();

  return Promise.resolve(panel);
};

const setupWebviewPanel = (context: vscode.ExtensionContext) => {
  const panel = vscode.window.createWebviewPanel(
    "diagrammatic",
    "Diagrammatic",
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
