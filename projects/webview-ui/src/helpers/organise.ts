import { SerializedDiagnostic } from "@shared/vscode.types";

type GroupedIssues = {[key:string]: SerializedDiagnostic[]};
type ClassifiedIssues = {[key:string]: {
    message: string;
    severity: number;
    lineNumbers: number[];
}};
export const groupIssues = (issues: SerializedDiagnostic[]): GroupedIssues => {
    const groupedIssues = issues.reduce<GroupedIssues>((acc, issue) => {
        const {source} = issue
        if (!source){
            return acc;
        }
        acc[source] = acc[source] || [];
        acc[source].push(issue);
        return acc;
    }, {});
    return groupedIssues;
};

