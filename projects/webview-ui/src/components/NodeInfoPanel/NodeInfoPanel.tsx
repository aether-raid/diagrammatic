import React from "react";

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

    const metadata = [
      ["Filepath", entity?.data.filePath],
      ["Metadata", "placeholder text"],
      ["Metadata", "placeholder text"]
    ];

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
                                <Accordion.Body className="p-0">
                                    <div className="d-flex flex-column fs-7">
                                        { metadata.map((item, idx) => (
                                            <div key={idx} className="d-flex gap-3 border-bottom p-2 px-3">
                                                <div className="w-25 text-break fw-bold">{item[0]}</div>
                                                <div className="w-75 text-break">{item[1]}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                        {(Object.entries(entity.data.security ?? []) as [string, SerializedDiagnostic[]][])
                            .map(([type, issues], idx) => {
                                if (issues.length === 0) return;
                                return (<SecurityTypeAccordion key={idx} type={type} issues={issues} filePath={entity.data.filePath} />);
                            })
                        }
                    </div>
                    : <p>No selected node<br/>(how did you even open this panel..?)</p>
                }
            </Offcanvas.Body>
            
        </Offcanvas>
    )
}
