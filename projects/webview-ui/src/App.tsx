import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom"

import {
    AcceptComponentDiagramDataPayload,
    AcceptNodeEdgeDataPayload,
    Commands,
    WebviewCommandMessage
} from "@shared/message.types";

import { useNodeEdgeDataContext } from "./contexts/NodeEdgeDataContext";
import { sendReadyMessageToExtension } from "./helpers/vscodeApiHandler";
import CodeView from "./views/CodeView"
import ComponentView from "./views/ComponentView"

export const App = () => {
    const nodeEdgeCtx = useNodeEdgeDataContext();

    useEffect(() => {
        // Setup message listener
        const onMessage = (event: MessageEvent<WebviewCommandMessage>) => {
            const { command, message } = event.data;

            switch (command) {
                case Commands.ACCEPT_NODE_EDGE_DATA: {
                    const msg = message as AcceptNodeEdgeDataPayload;
                    // msg.nodes = retainNodePositions(msg.nodes, nodesRef.current);
                    nodeEdgeCtx?.setCodeNodeEdgeData({
                        nodes: msg.nodes,
                        edges: msg.edges,
                    });
                    break;
                }
                case Commands.ACCEPT_COMPONENT_DIAGRAM_DATA: {
                    const msg = message as AcceptComponentDiagramDataPayload;
                    // msg.nodes = retainNodePositions(msg.nodes, nodesRef.current);
                    nodeEdgeCtx?.setComponentNodeEdgeData({
                        nodes: msg.nodes,
                        edges: msg.edges,
                    });
                    break;
                }
            }
        };

        window.addEventListener("message", onMessage);

        try {
            sendReadyMessageToExtension();
        } catch (error) {
            if (
                (error as Error).message !==
                "acquireVsCodeApi is not defined"
            ) {
                // Only catch the above error, throw all else
                throw error;
            }
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
