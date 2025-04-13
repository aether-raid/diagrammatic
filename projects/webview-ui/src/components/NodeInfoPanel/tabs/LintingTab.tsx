import { EntityLintData } from "@shared/node.types";

import { SecurityTypeAccordion } from "../SecurityTypeAccordion";
import { SerializedDiagnostic } from "@shared/vscode.types";

interface LintingTabProps {
    securityData: EntityLintData | undefined;
    filePath?: string;

}

export const LintingTab = ({ securityData, filePath }: LintingTabProps) => {
    if (!securityData) {
        return "This node type does not support linting.";
    }

    if (securityData.clean?.length === 0
        && securityData.vulnerability?.length === 0
        && securityData.extras?.length === 0
    ) {
        return "No linting issues were found for this node.";
    }

    return (
        (Object.entries(securityData ?? []) as [string, SerializedDiagnostic[]][])
            .map(([type, issues], idx) => {
                if (issues.length === 0) return;
                return (<SecurityTypeAccordion key={idx} type={type} issues={issues} filePath={filePath} />);
            })
    )
};
