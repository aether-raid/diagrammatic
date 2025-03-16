import "@xyflow/react/dist/style.css"; // Must import this, else React Flow will not work!

import {
    Background,
    Controls,
    MiniMap,
    Panel,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from "@xyflow/react";
import {
    AcceptComponentDiagramDataPayload,
    Commands,
    WebviewCommandMessage,
} from "@shared/message.types";
import { initialCompNodes, nodeTypes } from "./nodes";
import { initialCompEdges } from "./edges";
import React, { useCallback, useEffect, useRef, useState } from "react";
import HomeButton from "./components/HomeButton";
import { sendReadyMessageToExtension } from "./helpers/vscodeApiHandler";
import DownloadButton from "./components/DownloadButton";
import { AppNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types";
import { getLayoutedElements } from "./helpers/layoutHandlerDagre";
import { retainNodePositions } from "./helpers/nodePositionHandler";

const LayoutFlow = () => {
    const { fitView } = useReactFlow<AppNode, AppEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialCompNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialCompEdges);

    // Hover Highlighting states
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

    // Stable Reference to node variable
    const nodesRef = useRef(nodes);

    // General constants
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 2;

    const onEdgeMouseEnter = (_event: React.MouseEvent, edgeId: string) => {
        setHighlightedEdges([edgeId]);
    };
    const onEdgeMouseLeave = () => {
        setHighlightedEdges([]);
    };
    const onNodeMouseEnter = (_event: React.MouseEvent, nodeId: string) => {
        // Find edges connected to this node
        const relatedEdges = edges
            .filter((edge) => edge.source === nodeId || edge.target === nodeId)
            .map((edge) => edge.id);

        setHighlightedNodes([nodeId]); // Highlight the hovered node
        setHighlightedEdges(relatedEdges); // Highlight connected edges
    };

    const onNodeMouseLeave = () => {
        setHighlightedNodes([]);
        setHighlightedEdges([]);
    };

    useEffect(() => {
      nodesRef.current = nodes;
    }, [nodes]);

    useEffect(() => {
        // Setup message listener
        const onMessage = (event: MessageEvent<WebviewCommandMessage>) => {
            const { command, message } = event.data;
            switch (command) {
                case Commands.ACCEPT_COMPONENT_DIAGRAM_DATA: {
                    const msg = message as AcceptComponentDiagramDataPayload;
                    msg.nodes = retainNodePositions(msg.nodes, nodesRef.current);
                    setNodes(msg.nodes);
                    setEdges(msg.edges);
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

    const onLayout = useCallback(
        (direction: string) => {
            const layouted = getLayoutedElements(nodes, edges, { direction });
            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);

            // Re-fit the viewport to the new graph
            window.requestAnimationFrame(() => {
                fitView();
            });
        },
        [nodes, edges]
    );

    const prepareNode = (node: AppNode) =>
        node.type !== "componentEntity"
            ? node
            : {
                  ...node,
                  data: {
                      ...node.data,
                  },
                  style: {
                      border: highlightedNodes.includes(node.id)
                          ? "1px solid greenyellow"
                          : "",
                      borderRadius: highlightedNodes.includes(node.id)
                          ? "5px"
                          : "",
                  },
              };

    const prepareEdge = (edge: AppEdge) => ({
        ...edge,
        className: highlightedEdges.includes(edge.id) ? "highlighted-edge" : "",
    });

    return (
        <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes.map((n) => prepareNode(n))}
            edges={edges.map((e) => prepareEdge(e))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeMouseEnter={(event, edge) => onEdgeMouseEnter(event, edge.id)}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onNodeMouseEnter={(event, node) => onNodeMouseEnter(event, node.id)}
            onNodeMouseLeave={onNodeMouseLeave}
            fitView
            colorMode="dark"
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
        >
            <Panel position="top-center">
                <button onClick={() => onLayout("TB")}>Vertical Layout</button>
                <button onClick={() => onLayout("LR")}>
                    Horizontal Layout
                </button>
            </Panel>
            <MiniMap />
            <Controls />
            <Panel position="top-right">
                <div className="d-flex flex-column gap-2">
                    <DownloadButton minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
                    <HomeButton />
                </div>
            </Panel>
            <Background />
        </ReactFlow>
    );
};

const CompView = () => {
    return (
        <ReactFlowProvider>
            <LayoutFlow />
        </ReactFlowProvider>
    );
};

export default CompView;
