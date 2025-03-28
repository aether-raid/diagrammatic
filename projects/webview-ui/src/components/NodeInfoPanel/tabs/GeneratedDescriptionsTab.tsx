import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { useReactFlow } from '@xyflow/react';
import { AppNode, EntityItem } from "@shared/node.types";

import { sendGenerateFnDescriptionMessageToExtension } from '../../../helpers/vscodeApiHandler';
import { AppEdge } from '@shared/edge.types';
import { useDiagramContext } from '../../../contexts/DiagramContext';
import { ViewType } from '../../../App.types';

interface GeneratedDescriptionsTabProps {
    nodeId: string;
    items: EntityItem[];
}

export const GeneratedDescriptionsTab = ({ nodeId, items }: GeneratedDescriptionsTabProps) => {
    const { getNodes, getEdges } = useReactFlow<AppNode, AppEdge>();
    const diagramCtx = useDiagramContext(ViewType.CODE_VIEW);

    const saveStateToContext = () => {
        diagramCtx?.setGraphData({
            nodes: getNodes(),
            edges: getEdges(),
        });
    }

    const handleClick = () => {
        saveStateToContext();
        sendGenerateFnDescriptionMessageToExtension(nodeId);
    }

    return (
        <div className="d-flex flex-column gap-2">
            <Button onClick={handleClick}>
                Generate
            </Button>
            <Form>
                <Form.Group className="d-flex align-items-center gap-2 fs-7">
                    <Form.Label htmlFor="select-fn" className="mb-0 fw-bold text-nowrap">Generate for:</Form.Label>
                    <Form.Select id="select-fn" size="sm">
                        {items.map((item, idx) => <option key={idx} value={item.name}>{item.name}</option>)}
                    </Form.Select>
                </Form.Group>
            </Form>
            <p>{items[0].documentation?.parameters[0].description}</p>
        </div>
    );
};
