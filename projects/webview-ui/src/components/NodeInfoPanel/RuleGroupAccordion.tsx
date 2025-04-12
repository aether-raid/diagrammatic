import Accordion from 'react-bootstrap/Accordion';

import DangerousRoundedIcon from '@mui/icons-material/DangerousRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

import { DiagnosticSeverityEnum, SerializedDiagnostic } from '@shared/vscode.types';
import { IssueItem } from './IssueItem';

import "./styles/RuleGroupAccordion.css";

interface RuleGroupAccordionProps {
    ruleGroups: [string, SerializedDiagnostic[]][]
    filePath?: string;
}

export const RuleGroupAccordion = ({ ruleGroups, filePath }: RuleGroupAccordionProps) => {
    const {
        Warning: WARNING,
    } = DiagnosticSeverityEnum;

    return (
        <Accordion
            flush
            className="small-accordion"
        >
            {ruleGroups.map(([rule, issues], idx) => {
                const severity = issues[0].severity; // Severity is the same throughout the entire rule group

                return (
                    <Accordion.Item
                        key={idx}
                        eventKey={`nested-${idx}`}
                        className={`${severity === WARNING ? "warning-item" : "error-item"}`}
                    >
                        <Accordion.Header>
                            <div className="d-flex gap-2 align-items-center">
                                { severity === WARNING ? <WarningRoundedIcon /> : <DangerousRoundedIcon /> }
                                { rule }
                            </div>
                        </Accordion.Header>
                        <Accordion.Body className="p-0">
                            {issues.map((issue, idx2) => <IssueItem key={idx2} issue={issue} filePath={filePath} />)}
                        </Accordion.Body>
                    </Accordion.Item>
                );
            })}
        </Accordion>
    );
};
