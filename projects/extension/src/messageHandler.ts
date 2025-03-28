import * as vscode from "vscode";

import {
  Commands,
  AcceptComponentDiagramDataPayload,
  AcceptNodeEdgeDataPayload,
  UpdateFeatureStatusPayload,
  AcceptFnDescriptionPayload,
} from "@shared/message.types";

export const sendAcceptNodeEdgeMessageToWebview = (
  payload: AcceptNodeEdgeDataPayload,
  panel: vscode.WebviewPanel
) => {
  panel.webview.postMessage({
    command: Commands.ACCEPT_NODE_EDGE_DATA,
    message: payload,
  });
};

export const sendAcceptCompNodeEdgeMessageToWebview = (
  payload: AcceptComponentDiagramDataPayload | undefined,
  panel: vscode.WebviewPanel
) => {
  panel.webview.postMessage({
    command: Commands.ACCEPT_COMPONENT_DIAGRAM_DATA,
    message: payload ?? { nodes: [], edges: [] },
  });
};

export const sendAcceptFnDescriptionMessageToWebview = (
  payload: AcceptFnDescriptionPayload,
  panel: vscode.WebviewPanel,
) => {
  panel.webview.postMessage({
    command: Commands.ACCEPT_FN_DESCRIPTIONS,
    message: payload,
  });
};

export const sendUpdateFeatureStatusMessageToWebview = (
  payload: UpdateFeatureStatusPayload,
  panel: vscode.WebviewPanel,
) => {
  panel.webview.postMessage({
    command: Commands.UPDATE_FEATURE_STATUS,
    message: payload,
  })
}
