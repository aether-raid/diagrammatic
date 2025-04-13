// *********************************
// Layout using Dagre.js
// *********************************
import { useCallback, useState } from "react";

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

import { Feature, FeatureStatus, NodeRow } from "@shared/app.types";
import { AppNode, EntityNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types";
import { useFeatureStatusContext } from "../../contexts/FeatureStatusContext";
import { useDiagramContext } from "../../contexts/DiagramContext";

import { nodeTypes } from "../../nodes";
import { ViewType } from "../../App.types";
import DownloadButton from "../../components/DownloadButton";
import { HighlightConnectedPathHandler } from "../../components/HighlightConnectedPathHandler";
import { NavigationButton } from "../../components/NavigationButton";
import { NodeInfoPanel } from "../../components/NodeInfoPanel/NodeInfoPanel";
import { SearchBar } from "../../components/SearchBar";
import { ViewChangeHandler } from "../../components/ViewChangeHandler";
import { getLayoutedElements } from "../../helpers/layoutHandlerDagre";
import { AutoLayoutButton } from "../../components/AutoLayoutButton";

const LayoutFlow = () => {
    // General ReactFlow states
    const { fitView, getViewport } = useReactFlow<AppNode, AppEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);

    // Hover Highlighting states
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
    const [hoveredEntity, setHoveredEntity] = useState<NodeRow | undefined>(
        undefined
    );

    // Search Highlighting states
    const [matchedNodes, setMatchedNodes] = useState<AppNode[]>([]);

    // Collapsible Side Panel for node data
    const [panelNode, setPanelNode] = useState<EntityNode>();

    // Global contexts
    const featureStatusCtx = useFeatureStatusContext();
    const componentDiagramStatus = featureStatusCtx?.getFeatureStatus(Feature.COMPONENT_DIAGRAM);

    const diagramCtx = useDiagramContext(ViewType.CODE_VIEW);

    // General constants
    const CURRENT_VIEW = ViewType.CODE_VIEW;
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 2;

    const handleBeforeNavigate = () => {
        if (!diagramCtx) { return }
        diagramCtx.setGraphData({
            nodes: nodes,
            edges: edges,
            isTouched: true,
        });
        diagramCtx.setViewport(getViewport());
    }

    const renderNavigateButtonText = () => {
        switch (componentDiagramStatus) {
            case FeatureStatus.ENABLED_LOADING:
                return "Loading Component Diagram...";
            case FeatureStatus.ENABLED_DONE:
                return "Switch to Component View";
            default:
                // Disabled or unknown status
                return "Component View Disabled";
        }
    }

    const handleLayout = useCallback(
        (direction: string) => {
            const layouted = getLayoutedElements(nodes, edges, { direction });
            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);

            // Re-fit the viewport to the new graph
            setTimeout(() => {
                window.requestAnimationFrame(() => {
                    fitView();
                });
            }, 1);
        },
        [nodes, edges]
    );

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
                    setters: {
                        setHoveredEntity,
                        setPanelNode,
                    }
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
                colorMode="dark"
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
            >
                {/* Handlers */}
                <HighlightConnectedPathHandler
                    hoveredEntity={hoveredEntity}
                    setHighlightedEdges={setHighlightedEdges}
                    setHighlightedNodes={setHighlightedNodes}
                />
                <ViewChangeHandler view={CURRENT_VIEW} handleLayout={handleLayout} />

                {/* Displayed Elements */}
                <SearchBar matchedNodesState={[matchedNodes, setMatchedNodes]} />
                <MiniMap />
                <Controls />
                <Panel position="top-right">
                    <div className="d-flex flex-column gap-2 align-items-end">
                        <NavigationButton
                            target="/componentView"
                            label={renderNavigateButtonText()}
                            disabled={componentDiagramStatus !== FeatureStatus.ENABLED_DONE}
                            onNavigate={handleBeforeNavigate}
                        />
                    </div>
                    <div className="d-flex flex-column gap-2 align-items-end my-2">
                        <div
                            className="bg-light rounded"
                            style={{ height: "2px", width: "42px" }}
                        />
                    </div>
                    <div className="d-flex flex-column gap-2 align-items-end">
                        <AutoLayoutButton handleLayout={handleLayout} />
                        <DownloadButton minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
                    </div>
                </Panel>
                <Background />

                <NodeInfoPanel
                    entity={panelNode}
                    setEntity={setPanelNode}
                />
            </ReactFlow>
    );
};

const CodeView = () => {
    return (
        <ReactFlowProvider>
            <LayoutFlow />
        </ReactFlowProvider>
    );
};

export default CodeView;
