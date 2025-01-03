import { Commands, ReadyPayload } from "@shared/message.types";

export const sendReadyMessageToExtension = (vscode: any) => {
  const payload: ReadyPayload = {};
  vscode.postMessage({
    command: Commands.READY,
    message: payload,
  });
};
