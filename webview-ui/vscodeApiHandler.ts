import { Commands, JumpToLinePayload, ReadyPayload } from "@shared/message.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let vscode: any = undefined;

export const initVsCodeApi = () => {
  // @ts-expect-error: Expected, part of native VSCode API.
  // eslint-disable-next-line no-undef
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
