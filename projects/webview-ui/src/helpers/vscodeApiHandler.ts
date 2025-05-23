import { Commands, GenerateFnDescriptionPayload, JumpToLinePayload, ReadyPayload, RegenerateComponentDiagramPayload } from "@shared/message.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let vscode: any = undefined;

const initVsCodeApi = () => {
    if (vscode) return;

    // @ts-expect-error: Expected, part of native VSCode API.
    // eslint-disable-next-line no-undef
    vscode = acquireVsCodeApi();
}

export const sendJumpToLineMessageToExtension = (filePath: string, lineNumber: number) => {
    initVsCodeApi();

    const payload: JumpToLinePayload = {
        filePath,
        lineNumber,
    }

    vscode.postMessage({
        command: Commands.JUMP_TO_LINE,
        message: payload,
    });
}

export const sendReadyMessageToExtension = () => {
    initVsCodeApi();

    const payload: ReadyPayload = {};
    vscode.postMessage({
        command: Commands.READY,
        message: payload,
    });
};

export const sendRegenerateComponentDiagramMessageToExtension = () => {
    initVsCodeApi();

    const payload: RegenerateComponentDiagramPayload = {};
    vscode.postMessage({
        command: Commands.GET_COMPONENT_DIAGRAM,
        message: payload,
    });
}

export const sendGenerateFnDescriptionMessageToExtension = (nodeId: string) => {
    initVsCodeApi();

    const payload: GenerateFnDescriptionPayload = {
        nodeId,
    };
    vscode.postMessage({
        command: Commands.GENERATE_FN_DESCRIPTIONS,
        message: payload,
    })
}
