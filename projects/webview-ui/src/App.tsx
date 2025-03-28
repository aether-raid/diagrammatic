import { useEffect, useRef } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { Feature, FeatureStatus } from "@shared/app.types";
import {
    AcceptComponentDiagramDataPayload,
    AcceptFnDescriptionPayload,
    AcceptNodeEdgeDataPayload,
    Commands,
    UpdateFeatureStatusPayload,
    WebviewCommandMessage
} from "@shared/message.types";

import { useDiagramContext } from "./contexts/DiagramContext";
import { useFeatureStatusContext } from "./contexts/FeatureStatusContext";

import { ViewType } from "./App.types";
import { sendReadyMessageToExtension } from "./helpers/vscodeApiHandler";
import CodeView from "./views/codeView/CodeView"
import ComponentView from "./views/componentView/ComponentView"
import { attachFnDescriptionsToNode } from "./helpers/nodeFnDescriptionHandler";

export const App = () => {
    const codeDiagramCtx = useDiagramContext(ViewType.CODE_VIEW);
    const componentDiagramCtx = useDiagramContext(ViewType.COMPONENT_VIEW);
    const featureStatusCtx = useFeatureStatusContext();

    const codeCtxRef = useRef(codeDiagramCtx);
    const componentCtxRef = useRef(componentDiagramCtx);

    useEffect(() => {
        codeCtxRef.current = codeDiagramCtx;
    }, [codeDiagramCtx])

    useEffect(() => {
        componentCtxRef.current = componentDiagramCtx;
    }, [componentDiagramCtx])

    useEffect(() => {
        // Setup message listener
        const onMessage = (event: MessageEvent<WebviewCommandMessage>) => {
            const { command, message } = event.data;
            switch (command) {
                case Commands.ACCEPT_COMPONENT_DIAGRAM_DATA: {
                    const msg = message as AcceptComponentDiagramDataPayload;
                    componentDiagramCtx?.setGraphData({
                        nodes: msg.nodes,
                        edges: msg.edges,
                    })
                    break;
                }
                case Commands.ACCEPT_FN_DESCRIPTIONS: {
                    const msg = message as AcceptFnDescriptionPayload;
                    if (!codeCtxRef.current?.graphData) {
                        console.error("ACCEPT_FN_DESCRIPTION - Unable to retrieve diagram from context!");
                        return;
                    }

                    attachFnDescriptionsToNode(codeCtxRef.current, msg.nodeId, msg.data);
                    codeDiagramCtx?.setGraphData({
                        nodes: codeCtxRef.current.graphData.nodes,
                        edges: codeCtxRef.current.graphData.edges,
                    });
                    break;
                }
                case Commands.ACCEPT_NODE_EDGE_DATA: {
                    const msg = message as AcceptNodeEdgeDataPayload;
                    codeDiagramCtx?.setGraphData({
                        nodes: msg.nodes,
                        edges: msg.edges,
                    });
                    break;
                }
                case Commands.UPDATE_FEATURE_STATUS: {
                    const msg = message as UpdateFeatureStatusPayload;
                    featureStatusCtx?.setFeatureStatus(
                        msg.feature,
                        msg.status
                    );
                }
            }
        };

        window.addEventListener("message", onMessage);

        try {
            sendReadyMessageToExtension();
        } catch (error) {
            if ((error as Error).message === "acquireVsCodeApi is not defined") {
                // Only catch the above error, throw all else
                featureStatusCtx?.setFeatureStatus(Feature.COMPONENT_DIAGRAM, FeatureStatus.ENABLED_DONE);
                featureStatusCtx?.setFeatureStatus(Feature.NODE_DESCRIPTIONS, FeatureStatus.ENABLED_DONE);
                return;
            }
            throw error;
        }

        return () => {
            // Remove event listener on component unmount
            window.removeEventListener("message", onMessage);
        };
    }, []);

    return (
        <MemoryRouter>
            <Routes>
                <Route path="/" element={<CodeView />} />
                <Route path="/componentView" element={<ComponentView />} />
            </Routes>
        </MemoryRouter>
    )
}
