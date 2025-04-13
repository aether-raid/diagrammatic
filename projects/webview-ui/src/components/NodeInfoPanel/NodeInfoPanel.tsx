import React from "react";

import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { EntityNode } from '@shared/node.types';

import { LintingTab } from "./tabs/LintingTab";
import { GeneratedDescriptionsTab } from "./tabs/GeneratedDescriptionsTab";
import { sendJumpToLineMessageToExtension } from "../../helpers/vscodeApiHandler";

import "./styles/NodeInfoPanel.css";

interface NodeInfoPanelProps {
    entity: EntityNode | undefined;
    setEntity: React.Dispatch<React.SetStateAction<EntityNode | undefined>>;
}

export const NodeInfoPanel = ({ entity, setEntity }: NodeInfoPanelProps) => {
    const onHide = () => setEntity(undefined);

    return (
        <Offcanvas
            backdrop={false}
            scroll={true}
            onHide={onHide}
            show={entity !== undefined}
        >
            <Offcanvas.Header className="gap-2 align-items-start border-bottom border-2 pb-2 px-3" closeButton>
                <div>
                    <Offcanvas.Title>{ entity?.data.entityName ?? "-" }</Offcanvas.Title>
                    <div className="fst-italic text-break fs-7 mt-1 mb-2">
                        {entity?.data.filePath}
                    </div>
                    <Button variant="primary" size="sm" onClick={() => sendJumpToLineMessageToExtension(entity?.data.filePath ?? "", 0)}>
                        Go to File
                    </Button>
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
