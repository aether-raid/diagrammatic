export enum ViewType {
  CODE_VIEW = "codeView",
  COMPONENT_VIEW = "componentView",
}

export interface CodeLocation {
  filePath: string | undefined;
  lineNumber: number | undefined;
}
