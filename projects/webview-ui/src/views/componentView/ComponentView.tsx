import React, { useCallback, useEffect, useRef, useState } from "react";

import {
    Background,
    Controls,
    MiniMap,
    Panel,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from "@xyflow/react";

import { AppNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types";

import { useDiagramContext } from "../../contexts/DiagramContext";

import { initialCompNodes, nodeTypes } from "../../nodes";
import { initialCompEdges } from "../../edges";
import DownloadButton from "../../components/DownloadButton";
import { NavigationButton } from "../../components/NavigationButton";
import { getLayoutedElements } from "../../helpers/layoutHandlerDagre";
import { retainNodePositions } from "../../helpers/nodePositionHandler";

const LayoutFlow = () => {
    const { fitView, getViewport, setViewport } = useReactFlow<AppNode, AppEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialCompNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialCompEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<AppNode, AppEdge>>();

    // Hover Highlighting states
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

    // Stable Reference to node variable
    const nodesRef = useRef(nodes);

    // Global context, use to retain states when changing views
    const diagramCtx = useDiagramContext();

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
        // TODO: Properly refactor this if have time
        // > useReactFlow() should be called inside the ReactFlow component, not outside like this
        if (!diagramCtx?.componentView.graphData) {
            console.error("Unable to retrieve data from context!");
            return;
        }
        setNodes(retainNodePositions(diagramCtx.componentView.graphData.nodes, nodesRef.current));
        setEdges(diagramCtx.componentView.graphData.edges);

        if (diagramCtx.componentView.viewport) {
            setViewport(diagramCtx.componentView.viewport);
        }
    }, [diagramCtx?.componentView, reactFlowInstance]);

    const handleBeforeNavigate = () => {
        if (!diagramCtx) { return; }
        diagramCtx.componentView.setGraphData({
            nodes: nodes,
            edges: edges,
        });
        diagramCtx.componentView.setViewport(getViewport());
    }

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
            onInit={setReactFlowInstance}
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
                    <NavigationButton
                        target="/"
                        label="Code View"
                        onNavigate={handleBeforeNavigate}
                    />
                </div>
            </Panel>
            <Background />
        </ReactFlow>
    );
};

const ComponentView = () => {
    return (
        <ReactFlowProvider>
            <LayoutFlow />
        </ReactFlowProvider>
    );
};

export default ComponentView;
