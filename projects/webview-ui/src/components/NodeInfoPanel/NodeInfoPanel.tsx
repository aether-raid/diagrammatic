import React from "react";

import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { EntityNode } from '@shared/node.types';

import { LintingTab } from "./tabs/LintingTab";
import { GeneratedDescriptionsTab } from "./tabs/GeneratedDescriptionsTab";

import "./styles/NodeInfoPanel.css";

interface NodeInfoPanelProps {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    entity?: EntityNode;
}

export const NodeInfoPanel = ({ show, setShow, entity }: NodeInfoPanelProps) => {
    const onHide = () => setShow(false);

    const metadata = [
      ["Filepath", entity?.data.filePath],
    ];

    return (
        <Offcanvas
            backdrop={false}
            scroll={true}
            onHide={onHide}
            show={show}
        >
            <Offcanvas.Header className="gap-2 align-items-start border-bottom border-2 pb-2 px-3" closeButton>
                <div>
                    <Offcanvas.Title>{ entity?.data.entityName ?? "-" }</Offcanvas.Title>
                    <div className="fst-italic text-break fs-7">
                        {entity?.data.filePath}
                    </div>
                </div>
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

                        <Tabs defaultActiveKey="linting">
                            <Tab title="Linting" eventKey="linting">
                                <div className="d-flex flex-column gap-4">
                                    <LintingTab
                                        securityData={entity.data.security}
                                        filePath={entity.data.filePath}
                                    />
                                </div>
                            </Tab>

                            <Tab title="Generated Descriptions" eventKey="gen-desc">
                                <div className="d-flex flex-column gap-4">
                                    {entity.data.entityType === 'file'
                                        ? <GeneratedDescriptionsTab
                                            nodeId={entity.id}
                                            items={entity.data.items}
                                        />
                                        : "This node type does not support description generation."
                                    }
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                    : <p>No selected node<br/>(how did you even open this panel..?)</p>
                }
            </Offcanvas.Body>
            
        </Offcanvas>
    )
}
