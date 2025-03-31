import { SerializedDiagnostic } from "@shared/vscode.types";

type GroupedIssues = {[key:string]: SerializedDiagnostic[]};
// type ClassifiedIssues = {[key:string]: {
//     message: string;
//     severity: number;
//     lineNumbers: number[];
// }};
export const groupIssues = (issues: SerializedDiagnostic[]): GroupedIssues => {
    const groupedIssues = issues.reduce<GroupedIssues>((acc, issue) => {
        const {rule} = issue
        if (!rule){
            return acc;
        }
        acc[rule] = acc[rule] || [];
        acc[rule].push(issue);
        return acc;
    }, {});
    return groupedIssues;
};

