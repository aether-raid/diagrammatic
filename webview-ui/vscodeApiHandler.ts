import { Commands, JumpToLinePayload, ReadyPayload } from "@shared/message.types";


let vscode: any = undefined;

export const initVsCodeApi = () => {
  // @ts-ignore: Expected, part of native VSCode API.
  vscode = acquireVsCodeApi();
  return vscode;
}

export const sendReadyMessageToExtension = () => {
  const payload: ReadyPayload = {};
  vscode.postMessage({
    command: Commands.READY,
    message: payload,
  });
};

export const sendJumpToLineMessageToExtension = (filePath: string, lineNumber: number) => {
  const payload: JumpToLinePayload = {
    filePath,
    lineNumber,
  }

  vscode.postMessage({
    command: Commands.JUMP_TO_LINE,
    message: payload,
  });
}
