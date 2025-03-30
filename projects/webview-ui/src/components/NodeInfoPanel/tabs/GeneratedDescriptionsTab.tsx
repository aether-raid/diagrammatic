import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Placeholder from 'react-bootstrap/esm/Placeholder';

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
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const diagramCtx = useDiagramContext(ViewType.CODE_VIEW);

    useEffect(() => {
        setSelectedValue(items[0].name);
        setDisplayDesc(undefined);

        try {
            if (!diagramCtx?.nodeFnDesc?.[nodeId]) {
                // Only request from LLM if it wasn't retrieved previously
                setIsLoading(true);
                sendGenerateFnDescriptionMessageToExtension(nodeId);
            }
        } catch (e) {
            // Likely only happens during npm-run-dev when acquireVsCodeApi is not available
            console.error(e);
        }
    }, [items])

    useEffect(() => {
        if (!diagramCtx?.nodeFnDesc?.[nodeId]) {
            return;
        }
        setIsLoading(false);
        setDisplayDesc(
            diagramCtx?.nodeFnDesc?.[nodeId]
            ?.find(desc => desc.function_name === selectedValue)
        );
    }, [selectedValue, diagramCtx?.nodeFnDesc?.[nodeId]]);

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setSelectedValue(selected);
    }

    const PlaceholderBlock = () => {
        return (
            <Placeholder animation="glow" className="d-flex flex-column gap-1">
                <Placeholder xs={Math.ceil(Math.random() * (10-5)) + 5} />
                <div className="d-flex gap-1">
                    <Placeholder xs={Math.ceil(Math.random() * (6-2)) + 2} />
                    <Placeholder xs={Math.ceil(Math.random() * (5-3)) + 3} />
                </div>
                <Placeholder xs={Math.ceil(Math.random() * (12-7)) + 7} />
            </Placeholder>
        )
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
                    {items.map((item, idx) => <option key={idx} value={item.name}>{item.name}</option>)}
                </Form.Select>
            </Form>

            <div className="d-flex flex-column gap-3 fs-7">
                <div className="d-flex flex-column gap-2">
                    <div className="bg-primary-subtle p-1 fw-semibold">Function Description:</div>
                    { isLoading
                        ? <PlaceholderBlock />
                        : displayDesc &&
                            <div style={{ whiteSpace: "pre-line" }}>
                                {selectedValue &&
                                    (displayDesc?.function_description ?? "No description available.")
                                }
                            </div>
                    }
                </div>

                <div className="d-flex flex-column gap-2">
                    <div className="bg-primary-subtle p-1 fw-semibold">Parameters:</div>
                    { isLoading
                        ? <PlaceholderBlock />
                        : displayDesc?.parameters.map((param, idx) =>
                            <div key={idx} className="d-flex flex-column gap-1 ms-3">
                                <div className="fw-semibold">{param.inputName} : <span className="fst-italic">{param.inputType}</span></div>
                                <div className="ms-3">{param.description}</div>
                            </div>
                    )}
                </div>

                <div className="d-flex flex-column gap-2">
                    <div className="bg-primary-subtle p-1 fw-semibold">Returns:</div>
                    { isLoading
                        ? <PlaceholderBlock />
                        : <div className="d-flex flex-column gap-1 ms-3">
                            <div className="fw-semibold">{displayDesc?.output.outputName} : <span className="fst-italic">{displayDesc?.output.outputType}</span></div>
                            <div className="ms-3">{displayDesc?.output.description}</div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};
