import * as vscode from "vscode";
import { Linter } from "eslint";
import {
  DiagnosticSeverityEnum,
  SerializedDiagnostic,
} from "@shared/vscode.types";
import { BLACKLISTED_SOURCES, Sources, WHITELISTED_SOURCES } from "./definitions";
import type{ CppLintResult, CppLintMessage } from '../linters/definitions';

export const getDiagnostics = (messages: Linter.LintMessage[] | CppLintMessage[]) => {
  const diagnostics: vscode.Diagnostic[] = [];
  messages.forEach((msg) => {
    if (!msg.ruleId) {
      return;
    }
    const range = new vscode.Range(
      msg.line - 1,
      msg.column - 1,
      msg.endLine ? msg.endLine - 1 : msg.line - 1,
      msg.endColumn ? msg.endColumn - 1 : msg.column
    );
    const diagnostic = new vscode.Diagnostic(
      range,
      msg.message,
      msg.severity === 2
        ? vscode.DiagnosticSeverity.Error
        : vscode.DiagnosticSeverity.Warning
    );
    const validSource = filterSources(msg.ruleId);
    if (validSource) {
      diagnostic.source = `${validSource}`; 
      diagnostics.push(diagnostic);
    }
  });
  return diagnostics;
};

export const serializeDiagnostics = (
  diagnostic: vscode.Diagnostic
): SerializedDiagnostic => {
  return {
    range: {
      start: {
        line: diagnostic.range.start.line,
        character: diagnostic.range.start.character,
      },
      end: {
        line: diagnostic.range.end.line,
        character: diagnostic.range.end.character,
      },
    },
    message: diagnostic.message,
    severity: diagnostic.severity as number as DiagnosticSeverityEnum,
    source: diagnostic.source,
  };
};

const filterSources = (ruleId: string) => {
//   const source = ruleId.includes("/") ? ruleId.split("/")[0] : ruleId;
  if (BLACKLISTED_SOURCES.includes(ruleId)) {
      return null;
  } 
  const group = findKeyForValue(ruleId, WHITELISTED_SOURCES);
  if (group) {
    return group;
  }
  console.log("after:", group);
  return ruleId;
};

export const processCpplintOutput = (output: string): CppLintResult[] =>  {
    // (cpp filename):(line number): message [category] [column number]
    const regex = /(.+\.cpp|.+\.h):(\d+):\s+(.+)\s\[(.+)\]\s+\[(\d+)\]/g;
    let match;
    let filePath = "";
    const diagnostics:CppLintMessage[] = [];
    while ((match = regex.exec(output)) !== null) {
        const [_,file, line, message, messageId, column] = match;
        filePath = file;
        diagnostics.push({
            // 1 based index
            line: Math.max(parseInt(line, 10) + 1, 1),
            messageId: messageId,
            message,
            column: parseInt(column, 10),
            ruleId: messageId,
            // warning: 1, error: 2
            severity: 1
        });
    }
    return [{ filePath, messages: diagnostics }];
}

const findKeyForValue = (searchString: string, sources: Sources) => {
    return Object.entries(sources)
    .find(([key, values]) => 
        values.includes(searchString))?.[0] || null
};


