import Accordion from 'react-bootstrap/Accordion';

import { SerializedDiagnostic } from '@shared/vscode.types';
import { groupIssues } from '../../helpers/organise';
import { RuleGroupAccordion } from './RuleGroupAccordion';


interface SecurityTypeAccordionProps {
    type: string;
    issues: SerializedDiagnostic[];
    filePath?: string;
}

export const SecurityTypeAccordion = ({ type, issues, filePath }: SecurityTypeAccordionProps) => {
  const issuesByRuleGroups = groupIssues(issues);
  
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
              <RuleGroupAccordion
                ruleGroups={Object.entries(issuesByRuleGroups)}
                filePath={filePath}
              />
            </Accordion.Body>
        </Accordion.Item>
    </Accordion>
  );
};
