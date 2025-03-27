import React, { useCallback, useState } from "react";

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

import { AppNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types";

import { useDiagramContext } from "../../contexts/DiagramContext";

import { initialCompNodes, nodeTypes } from "../../nodes";
import { initialCompEdges } from "../../edges";
import { ViewType } from "../../App.types";
import DownloadButton from "../../components/DownloadButton";
import { NavigationButton } from "../../components/NavigationButton";
import { ViewChangeHandler } from "../../components/ViewChangeHandler";
import { getLayoutedElements } from "../../helpers/layoutHandlerDagre";
import { RegenerateButton } from "../../components/RegenerateButton";
import { Feature, FeatureStatus } from "@shared/app.types";
import { useFeatureStatusContext } from "../../contexts/FeatureStatusContext";

const LayoutFlow = () => {
    const { fitView, getViewport } = useReactFlow<AppNode, AppEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialCompNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialCompEdges);

    // Hover Highlighting states
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

    // Global context, use to retain states when changing views
    const diagramCtx = useDiagramContext(ViewType.COMPONENT_VIEW);

    // General constants
    const CURRENT_VIEW = ViewType.COMPONENT_VIEW;
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

    const handleBeforeNavigate = () => {
        if (!diagramCtx) { return; }
        diagramCtx.setGraphData({
            nodes: nodes,
            edges: edges,
        });
        diagramCtx.setViewport(getViewport());
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

    // Global contexts
    const featureStatusCtx = useFeatureStatusContext();
    const componentDiagramStatus = featureStatusCtx?.getFeatureStatus(Feature.COMPONENT_DIAGRAM);

    const renderComponentButtonText = () => {
        switch (componentDiagramStatus) {
            case FeatureStatus.ENABLED_LOADING:
                return "Loading Component Diagram...";
            case FeatureStatus.ENABLED_DONE:
                return "Regenerate Component Diagram";
            default:
                // Disabled or unknown status
                return "Component Diagram Disabled";
        }
    }
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
            colorMode="dark"
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
        >
            {/* Handlers */}
            <ViewChangeHandler view={CURRENT_VIEW}/>

            {/* Displayed Elements */}
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
                    <RegenerateButton 
                        label={renderComponentButtonText()} 
                        disabled={componentDiagramStatus !== FeatureStatus.ENABLED_DONE}
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
