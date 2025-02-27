import Accordion from 'react-bootstrap/Accordion';

import { SerializedDiagnostic } from '@shared/vscode.types';
import { IssueItem } from './IssueItem';


interface SecurityTypeAccordionProps {
    type: string;
    issues: SerializedDiagnostic[];
    filePath?: string;
}

export const SecurityTypeAccordion = ({ type, issues, filePath }: SecurityTypeAccordionProps) => {
  return (
    <Accordion alwaysOpen>
        <Accordion.Item eventKey='0'>
            <Accordion.Header className="">
                <div className="d-flex flex-column gap-1">
                    <div className="fs-7 fst-italic">Warning/Error</div>
                    <div className="fw-bold">Linting: { type }</div>
                </div>
            </Accordion.Header>
            <Accordion.Body className="p-0">
                { issues.map((issue, idx) => <IssueItem key={idx} issue={issue} filePath={filePath} />) }
            </Accordion.Body>
        </Accordion.Item>
    </Accordion>
  );
};
