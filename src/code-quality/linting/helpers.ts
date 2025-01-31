import * as vscode from 'vscode';
import { Linter } from "eslint";
import { BLACKLISTED_SOURCES, WHITELISTED_SOURCES } from './definitions';

export const getDiagnostics = (messages: Linter.LintMessage[]) => {
    const diagnostics: vscode.Diagnostic[] = [];
    console.log(messages);
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
    console.log(diagnostics);
    return diagnostics;
};


const filterSources = (ruleId: string) => {
    const source = ruleId.includes("/") ? ruleId.split("/")[0] : ruleId;
    if (Object.keys(WHITELISTED_SOURCES).includes(source)){
        return WHITELISTED_SOURCES[source];
    }else if (Object.keys(BLACKLISTED_SOURCES).includes(source)){
        return null;
    }
    return source;
};