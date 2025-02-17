import * as vscode from 'vscode';
import { Linter } from "eslint";

import { DiagnosticSeverityEnum, SerializedDiagnostic } from '@shared/vscode.types';

import { BLACKLISTED_SOURCES, WHITELISTED_SOURCES } from './definitions';

export const getDiagnostics = (messages: Linter.LintMessage[]) => {
    const diagnostics: vscode.Diagnostic[] = [];
    messages.forEach((msg) => {
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
