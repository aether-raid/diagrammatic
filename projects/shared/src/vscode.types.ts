// Mock version of vscode.DiagnosticSeverity
export enum DiagnosticSeverityEnum {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}

// Serialized version of vscode.Position
interface SerializedPosition {
  readonly line: number;
  readonly character: number;
}

// Serialized version of vscode.Range
interface SerializedRange {
  readonly start: SerializedPosition;
  readonly end: SerializedPosition;
}

// Serialized version of vscode.Diagnostic
export interface SerializedDiagnostic {
  rule?: string;
  range: SerializedRange;
  message: string;
  severity: DiagnosticSeverityEnum;
  source?: string;
}
