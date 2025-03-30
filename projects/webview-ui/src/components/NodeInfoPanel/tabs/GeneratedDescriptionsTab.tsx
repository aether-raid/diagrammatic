import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/esm/Form';

import { EntityItem, FunctionDescription } from "@shared/node.types";

import { useDiagramContext } from '../../../contexts/DiagramContext';

import { ViewType } from '../../../App.types';
import { sendGenerateFnDescriptionMessageToExtension } from '../../../helpers/vscodeApiHandler';

interface GeneratedDescriptionsTabProps {
    nodeId: string;
    items: EntityItem[];
}

export const GeneratedDescriptionsTab = ({ nodeId, items }: GeneratedDescriptionsTabProps) => {
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [displayDesc, setDisplayDesc] = useState<FunctionDescription>();

    const diagramCtx = useDiagramContext(ViewType.CODE_VIEW);

    useEffect(() => {
        setSelectedValue("");
        setDisplayDesc(undefined);

        try {
            if (!diagramCtx?.nodeFnDesc?.[nodeId]) {
                // Only request from LLM if it wasn't retrieved previously
                sendGenerateFnDescriptionMessageToExtension(nodeId);
            }
        } catch (e) {
            // Likely only happens during npm-run-dev when acquireVsCodeApi is not available
            console.error(e);
        }
    }, [items])

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setSelectedValue(selected);
        setDisplayDesc(diagramCtx?.nodeFnDesc?.[nodeId]?.find(desc => desc.function_name === selected));
    }

    return (
        <div className="d-flex flex-column gap-3">
            <Form className="fs-7">
                <Form.Label htmlFor="selectFn">Select a function to view its documentation</Form.Label>
                <Form.Select
                    id="selectFn"
                    value={selectedValue}
                    size="sm"
                    onChange={handleDropdownChange}
                    style={{
                        paddingLeft: "0.75rem",
                    }}
                >
                    <option value="" disabled hidden>Please select a function to view</option>
                    {items.map((item, idx) => <option key={idx} value={item.name}>{item.name}</option>)}
                </Form.Select>
            </Form>

            { displayDesc &&
                <div className="d-flex flex-column gap-3 fs-7">
                    <div className="d-flex flex-column gap-2">
                        <div className="bg-primary-subtle p-1 fw-semibold">Function Description:</div>
                        <div style={{ whiteSpace: "pre-line" }}>
                            {displayDesc.function_description ?? "No description available."}
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-2">
                        <div className="bg-primary-subtle p-1 fw-semibold">Parameters:</div>
                        {displayDesc.parameters.map((param, idx) =>
                            <div key={idx} className="d-flex flex-column gap-1 ms-3">
                                <div className="fw-semibold">{param.inputType}</div>
                                <div className="ms-3">{param.description}</div>
                            </div>
                        )}
                    </div>

                    <div className="d-flex flex-column gap-2">
                        <div className="bg-primary-subtle p-1 fw-semibold">Returns:</div>
                        <div className="d-flex flex-column gap-1 ms-3">
                            <div className="fw-semibold">{displayDesc.output.outputType}</div>
                            <div className="ms-3">{displayDesc.output.description}</div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};
