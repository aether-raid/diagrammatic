import * as vscode from "vscode";

import { AcceptNodeEdgeDataPayload, Commands } from "@shared/message.types";

export const sendAcceptNodeEdgeMessageToWebview = (
  payload: AcceptNodeEdgeDataPayload,
  panel: vscode.WebviewPanel
) => {
  panel.webview.postMessage({
    command: Commands.ACCEPT_NODE_EDGE_DATA,
    message: payload,
  });
};
