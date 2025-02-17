import { AppNode } from "@shared/node.types";
import { lintFile } from "./code-quality/linting";


export const runCodeLinting = async (inputNodes: AppNode[]): Promise<{
    lintedNodes: AppNode[],
    hasIssues: boolean,
}> => {
    const nodes = structuredClone(inputNodes);

    // console.log("node edge data before linting:", nodeEdgeData);
    // console.log("single node edge data before linting:", nodes[0]);

    let hasIssues = false;
    for (let node of nodes){
        if (!('entityName' in node.data) || !('filePath' in node.data)) {continue;}

        const { filePath, entityType } = node.data;
        if (entityType !== 'file' ||!filePath){continue;}

        const {diagnostics} = await lintFile(filePath);
        if (!diagnostics){continue;}

        // Initialize the security object in data
        node.data.security = node.data.security ?? {};
        node.data.security.clean = node.data.security.clean ?? [];
        node.data.security.vulnerability = node.data.security.vulnerability ?? [];
        node.data.security.extras = node.data.security.extras ?? [];

        for (const diag of diagnostics){
            switch (diag.source) {
                case "Group: clean-code":
                    node.data.security.clean.push(diag);
                    break;
                case "Group: security":
                    node.data.security.vulnerability.push(diag);
                    break;
                default:
                    node.data.security.extras.push(diag);
                    break;
            }
        }
        hasIssues = true;
    }

    console.log("node edge data after linting:", nodeEdgeData);
    // console.log("single node edge data after linting:", nodes[0]);

    return {
        lintedNodes: nodes,
        hasIssues: hasIssues
    };
};
