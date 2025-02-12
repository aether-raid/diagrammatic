export interface NodeRow {
  nodeId: string;
  rowId: string;
}

export enum DiagnosticSeverity {
    Error = 0,
    Warning = 1,
    Information = 2,
    Hint = 3
}