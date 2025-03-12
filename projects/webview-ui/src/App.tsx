// *********************************
// Layout using Dagre.js
// *********************************
import { useCallback, useEffect, useState } from "react";

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
import { AppNode, EntityNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types";
import {
    AcceptNodeEdgeDataPayload,
    Commands,
    WebviewCommandMessage,
} from "@shared/message.types";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges } from "./edges";

import {
    getEdgesEntitiesToHighlightBFS,
    getOutgoingEdgesFromEntityRow,
} from "./helpers/diagramBFS";
import { sendReadyMessageToExtension } from "./helpers/vscodeApiHandler";
import DownloadButton from "./components/DownloadButton";
import SearchBar from "./components/SearchBar";
import ComponentButton from "./components/CompButton";
import { NodeInfoPanel } from "./components/NodeInfoPanel/NodeInfoPanel";
import { getLayoutedElements } from "./helpers/layoutHandlerDagre";


const LayoutFlow = () => {
    // General ReactFlow states
    const { fitView, getNode, setCenter } = useReactFlow<AppNode, AppEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Hover Highlighting states
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
    const [hoveredEntity, setHoveredEntity] = useState<NodeRow | undefined>(
        undefined
    );

    // Search Highlighting states
    const [matchedNodes, setMatchedNodes] = useState<AppNode[]>([]);

    // Collapsible Side Panel for node data
    const [showNodeInfoPanel, setShowNodeInfoPanel] = useState<boolean>(false);
    const [panelNode, setPanelNode] = useState<EntityNode>();

    // General constants
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 2;

    useEffect(() => {
        // Setup message listener
        const onMessage = (event: MessageEvent<WebviewCommandMessage>) => {
            const { command, message } = event.data;

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
                    matchesSearchTerm: matchedNodes.map(match => match.id).includes(node.id),
                    setHoveredEntity,
                },
              };

    const prepareEdge = (edge: AppEdge) => ({
        ...edge,
        className: highlightedEdges.includes(edge.id) ? "highlighted-edge" : "",
    });

    return (
        <>
            <SearchBar
                nodes={nodes}
                setCenter={setCenter}
                matchedNodesState={[matchedNodes, setMatchedNodes]}
            />
            <ReactFlow
                nodeTypes={nodeTypes}
                nodes={nodes.map((n) => prepareNode(n))}
                edges={edges.map((e) => prepareEdge(e))}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_event, node) => {
                    if (node.type === 'entity') {
                        setPanelNode(node);
                        setShowNodeInfoPanel(true);
                    }
                }}
                fitView
                colorMode="dark"
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
            >
                <Panel position="top-center">
                    <button onClick={() => onLayout("TB")}>
                        Vertical Layout
                    </button>
                    <button onClick={() => onLayout("LR")}>
                        Horizontal Layout
                    </button>
                </Panel>
                <MiniMap />
                <Controls />
                <Panel position="top-right">
                    <div className="d-flex flex-column gap-2">
                        <DownloadButton minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
                        <ComponentButton />
                    </div>
                </Panel>
                <Background />

                <NodeInfoPanel
                    show={showNodeInfoPanel}
                    setShow={setShowNodeInfoPanel}
                    entity={panelNode}
                />
            </ReactFlow>
        </>
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
