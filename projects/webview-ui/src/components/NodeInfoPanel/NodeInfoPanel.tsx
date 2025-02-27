import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Offcanvas from 'react-bootstrap/Offcanvas';

import { EntityNode } from '@shared/node.types';
import { SerializedDiagnostic } from '@shared/vscode.types';
import { SecurityTypeAccordion } from './SecurityTypeAccordion';

import "./NodeInfoPanel.css";

interface NodeInfoPanelProps {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    entity?: EntityNode;
}

export const NodeInfoPanel = ({ show, setShow, entity }: NodeInfoPanelProps) => {
    const onHide = () => setShow(false);

    return (
        <Offcanvas
            backdrop={false}
            scroll={true}
            onHide={onHide}
            show={show}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{ entity?.data.entityName ?? "-" }</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                { entity 
                    ? <div className="d-flex flex-column gap-4">
                        <Card>
                            <Card.Header className="fw-bold">Description</Card.Header>
                            <Card.Body>
                                { entity.data.description ?? 'No description available.'}
                            </Card.Body>
                        </Card>
                        <Accordion alwaysOpen>
                            <Accordion.Item eventKey='0'>
                                <Accordion.Header>Metadata</Accordion.Header>
                                <Accordion.Body>
                                    <div className="d-flex gap-3">
                                        <div className="d-flex flex-column gap-3 fw-bold text-end">
                                            <div>Filepath</div>
                                            <div>Metadata</div>
                                            <div>Metadata</div>
                                        </div>
                                        <div className="d-flex flex-column flex-grow-1 gap-3 fst-italic">
                                            <div>{entity.data.filePath}</div>
                                            <div>placeholder text</div>
                                            <div>placeholder text</div>
                                        </div>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                        {(Object.entries(entity.data.security ?? []) as [string, SerializedDiagnostic[]][])
                            .map(([type, issues]) => {
                                if (issues.length === 0) return;
                                return (<SecurityTypeAccordion type={type} issues={issues} filePath={entity.data.filePath} />);
                            })
                        }
                    </div>
                    : <p>No selected node<br/>(how did you even open this panel..?)</p>
                }
            </Offcanvas.Body>
            
        </Offcanvas>
    )
}
