// *********************************
// Layout using Dagre.js
// *********************************

import Dagre from "@dagrejs/dagre";
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
import "@xyflow/react/dist/style.css"; // Must import this, else React Flow will not work!

import { NodeRow } from "@shared/app.types";
import { AppNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types";
import {
    AcceptNodeEdgeDataPayload,
    Commands,
    WebviewCommandMessage,
} from "@shared/message.types";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges } from "./edges";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    getEdgesEntitiesToHighlightBFS,
    getOutgoingEdgesFromEntityRow,
} from "./helper";
import { initVsCodeApi, sendReadyMessageToExtension } from "./vscodeApiHandler";
import DownloadButton from "./buttons/DownloadButton";

interface OptionProps {
    direction: string;
}

const getLayoutedElements = (
    nodes: AppNode[],
    edges: AppEdge[],
    options: OptionProps
) => {
    const g = new Dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: options.direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0,
        })
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);

            // Shift the dagre node anchor point (center-center)
            // to match the React Flow node anchor point (top-left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return { ...node, position: { x, y } };
        }),
        edges,
    };
};

const LayoutFlow = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vscode = useRef<any>(null);

    const { fitView, getNode } = useReactFlow<AppNode, AppEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
    const [hoveredEntity, setHoveredEntity] = useState<NodeRow | undefined>(
        undefined
    );

    useEffect(() => {
        // Setup message listener
        const onMessage = (event: MessageEvent<WebviewCommandMessage>) => {
            const { command, message } = event.data;

            // TODO: Refactor this into a non switch-case if possible
            switch (command) {
                case Commands.ACCEPT_NODE_EDGE_DATA: {
                    const msg = message as AcceptNodeEdgeDataPayload;
                    setNodes(msg.nodes);
                    setEdges(msg.edges);
                    break;
                }
            }
        };

        window.addEventListener("message", onMessage);

        // Send message to inform extension that webview is ready to receive data.
        if (!vscode.current) {
            try {
                initVsCodeApi();
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
        }

        return () => {
            // Remove event listener on component unmount
            window.removeEventListener("message", onMessage);
        };
    }, []);

    const onLayout = useCallback(
        (direction: string) => {
            console.log(nodes);
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

    useEffect(() => {
        // console.log("Currently hovering on: ", hoveredEntity);
        if (!hoveredEntity) {
            setHighlightedNodes([]);
            setHighlightedEdges([]);
            return;
        }

        const hoveredNode = getNode(hoveredEntity.nodeId)!; // Can safely assume it exists since it's part of the graph
        const outgoingEdges = getOutgoingEdgesFromEntityRow(
            hoveredNode,
            hoveredEntity.rowId,
            edges
        );
        const toHighlight = getEdgesEntitiesToHighlightBFS(
            outgoingEdges,
            edges,
            getNode
        );
        setHighlightedEdges(toHighlight.edges);

        const entityRepr = `${hoveredEntity.nodeId}-${hoveredEntity.rowId}`;
        setHighlightedNodes([entityRepr, ...toHighlight.entities]);
    }, [hoveredEntity, edges]);

    const prepareNode = (node: AppNode) =>
        node.type !== "entity"
            ? node
            : {
                  ...node,
                  data: {
                      ...node.data,
                      items: node.data.items.map((item) => {
                          item.highlighted = highlightedNodes.includes(
                              `${node.id}-${item.name}`
                          );
                          return item;
                      }),
                      setHoveredEntity,
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
            fitView
            colorMode="dark"
            className="download-image"
        >
            <Panel position="top-center">
                <button onClick={() => onLayout("TB")}>Vertical Layout</button>
                <button onClick={() => onLayout("LR")}>
                    Horizontal Layout
                </button>
            </Panel>
            <MiniMap />
            <Controls />
            <DownloadButton />
            <Background />
        </ReactFlow>
    );
};

const Flow = () => {
    return (
        <ReactFlowProvider>
            <LayoutFlow />
        </ReactFlowProvider>
    );
};

export default Flow;
