import { AppNode } from "@shared/node.types";
import { getDiagnosticsFromFile } from "./code-quality/linting";
import { serializeDiagnostics } from "./code-quality/linting/helpers";
import path from 'path';
import * as vscode from "vscode";
import { hasLinter } from "./code-quality/linters/index";
import { linters, SupportedLanguages } from "./code-quality/linters/definitions";
import { SerializedDiagnostic } from "@shared/vscode.types";


export const runCodeLinting = async (inputNodes: AppNode[]): Promise<{
    lintedNodes: AppNode[],
    hasIssues: boolean,
}> => {
    const nodes = structuredClone(inputNodes);
    let hasIssues = false;
    const seenExtension =  new Set<string>();
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const promises: Promise<void>[] = [];
    if (!workspacePath) { return { lintedNodes: nodes, hasIssues}};

// this loop gets the diagnostics for each file and puts the promises in an array
    for (let node of nodes){
// fields must exist
        if (!('entityName' in node.data) || !('filePath' in node.data)) { continue; }
        const { filePath, entityType } = node.data;
// only lint files
        if (entityType !== 'file' || !filePath) { continue; }
// check if file is supported
        const ext = path.extname(filePath).toLowerCase().replace('.', '') as string;
        if (!(ext in SupportedLanguages)) { continue; }
        const casted_ext = ext as keyof typeof SupportedLanguages;
        const linter = linters[casted_ext];

        const promise = getDiagnosticsFromFile(linter, filePath)
            .then(({diagnostics}) => {
                if (!diagnostics || !Array.isArray(diagnostics)) { 
                    return []; 
                }
                console.log("before serialise:", diagnostics);

                return diagnostics.map(diag => serializeDiagnostics(diag));
            })
            .then((diagnostics) => {
                if (!diagnostics) { return {}; }
                
                const security : {
                    clean: SerializedDiagnostic[],
                    vulnerability: SerializedDiagnostic[],
                    extras: SerializedDiagnostic[]
                } = { clean: [], vulnerability: [], extras: [] };

                for (const diag of diagnostics){
                    switch (diag.source) {
                        case "Group: clean-code":
                            security.clean.push(diag);
                            break;
                        case "Group: security":
                            security.vulnerability.push(diag);
                            break;
                        default:
                            security.extras.push(diag);
                            break;
                    }
                }
                return security;
            })
            .then((security) => {
                if (Object.keys(security).length < 1) {
                    return;
                }
                node.data = {...node.data, security: security};
                hasIssues = true;
            })
        promises.push(promise);
    }
    await Promise.allSettled(promises)
    console.log("node edge data after linting:", nodes);
    return {
        lintedNodes: nodes,
        hasIssues: hasIssues
    };
};


// // if file seen before, continue, else check if linter installed
//         if (!seenExtension.has(casted_ext)){
//             if(!hasLinter(workspacePath, casted_ext)){
// // if we dont have permission to install linter, return
//             // if (!promptInstallLinter(ext)){
//             //     vscode.window.showErrorMessage(`Require Linter for ${ext} files`);
//             //     return {
//             //         lintedNodes: inputNodes,
//             //         hasIssues: false
//             //     };
//             // };
//             }
//             seenExtension.add(ext);
//         }