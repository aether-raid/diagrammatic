import Accordion from 'react-bootstrap/Accordion';

import { SerializedDiagnostic } from '@shared/vscode.types';
import { LineItem } from './IssueItem';
import { CollapsibleGroup } from "./Collapsible";
import { groupIssues } from '../../helpers/organise';


interface SecurityTypeAccordionProps {
    type: string;
    issues: SerializedDiagnostic[];
    filePath?: string;
}

export const SecurityTypeAccordion = ({ type, issues, filePath }: SecurityTypeAccordionProps) => {
  const groupedIssues = groupIssues(issues);
  console.log('groupedIssues', groupedIssues);
  
  return (
    <Accordion alwaysOpen>
        <Accordion.Item eventKey='0'>
            <Accordion.Header>
                <div className="d-flex flex-column gap-1">
                    <div className="fs-7 fst-italic">Warning/Error</div>
                    <div className="fw-bold">Linting: { type }</div>
                </div>
            </Accordion.Header>
            <Accordion.Body className="p-0">
                {(Object.entries(groupedIssues) as [string, SerializedDiagnostic[]][])
                .map(([rule, issues], idx) => {
                    return (
                    <CollapsibleGroup key={idx} source={rule} message={issues[0].message} severity={issues[0].severity}>
                        {issues.map((issue, idx) => <LineItem key={idx} lineNumber={issue.range.start.line} filePath={filePath} />) }
                    </CollapsibleGroup>
                )})}
            </Accordion.Body>
        </Accordion.Item>
    </Accordion>
  );
};
