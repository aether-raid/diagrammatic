import * as vscode from 'vscode';
import { Linter } from "eslint";
import { DiagnosticSeverityEnum, SerializedDiagnostic } from '@shared/vscode.types';
import { BLACKLISTED_SOURCES, WHITELISTED_SOURCES } from './definitions';
import type{ CppLintResult, CppLintMessage } from '../linters/definitions';

export const getDiagnostics = (messages: Linter.LintMessage[] | CppLintMessage[]) => {
    const diagnostics: vscode.Diagnostic[] = [];
    messages.forEach((msg) => {
        console.log("msg:", msg);
        if (!msg.ruleId){
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
        if (validSource){
            diagnostic.source = `Group: ${validSource}`; // This can be your "section"
            diagnostics.push(diagnostic);
        }
    });
    return diagnostics;
};

export const serializeDiagnostics = (diagnostic: vscode.Diagnostic): SerializedDiagnostic => {
    return {
        range: {
            start: { line: diagnostic.range.start.line, character: diagnostic.range.start.character },
            end: { line: diagnostic.range.end.line, character: diagnostic.range.end.character },
        },
        message: diagnostic.message,
        severity: diagnostic.severity as number as DiagnosticSeverityEnum,
        source: diagnostic.source,
    }
}

const filterSources = (ruleId: string) => {
    const source = ruleId.includes("/") ? ruleId.split("/")[0] : ruleId;
    if (Object.keys(WHITELISTED_SOURCES).includes(source)){
        return WHITELISTED_SOURCES[source];
    }else if (Object.keys(BLACKLISTED_SOURCES).includes(source)){
        return null;
    }
    return source;
};


export const processCpplintOutput = (output: string): CppLintResult[] =>  {
    // (cpp filename):(line number): message [category] [column number]
    const regex = /(.+\.cpp):(\d+):\s+(.+)\s\[(.+)\]\s+\[(\d+)\]/g;
    let match;
    let filePath = "";
    const diagnostics:CppLintMessage[] = [];
    while ((match = regex.exec(output)) !== null) {
        const [_,file, line, message, messageId, column] = match;
        filePath = file;
        diagnostics.push({
            // 1 based index
            line: parseInt(line, 10) + 1,
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