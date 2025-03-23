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

import { Feature, FeatureStatus, NodeRow } from "@shared/app.types";
import { AppNode, EntityNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types";

import { initialNodes, nodeTypes } from "../../nodes";
import { initialEdges } from "../../edges";
import DownloadButton from "../../components/DownloadButton";
import { NavigationButton } from "../../components/NavigationButton";
import { NodeInfoPanel } from "../../components/NodeInfoPanel/NodeInfoPanel";
import SearchBar from "../../components/SearchBar";
import {
    getEdgesEntitiesToHighlightBFS,
    getOutgoingEdgesFromEntityRow,
} from "../../helpers/diagramBFS";
import { getLayoutedElements } from "../../helpers/layoutHandlerDagre";
import { useFeatureStatusContext } from "../../contexts/FeatureStatusContext";
import { useDiagramContext } from "../../contexts/DiagramContext";
import { ViewChangeHandler } from "../../components/ViewChangeHandler";

const LayoutFlow = () => {
    // General ReactFlow states
    const { fitView, getNode, getViewport, setCenter } = useReactFlow<AppNode, AppEdge>();
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

    // Global contexts
    const featureStatusCtx = useFeatureStatusContext();
    const componentDiagramStatus = featureStatusCtx?.getFeatureStatus(Feature.COMPONENT_DIAGRAM);

    const diagramCtx = useDiagramContext();

    // General constants
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 2;

    const handleBeforeNavigate = () => {
        if (!diagramCtx) { return }
        diagramCtx.codeView.setGraphData({
            nodes: nodes,
            edges: edges,
        });
        diagramCtx.codeView.setViewport(getViewport());
    }

    const renderComponentButtonText = () => {
        switch (componentDiagramStatus) {
            case FeatureStatus.ENABLED_LOADING:
                return "Loading Component Diagram...";
            case FeatureStatus.ENABLED_DONE:
                return "Component Diagram";
            default:
                // Disabled or unknown status
                return "Component Diagram Disabled";
        }
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
                colorMode="dark"
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
            >
                <ViewChangeHandler />
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
                        <NavigationButton
                            target="/componentView"
                            label={renderComponentButtonText()}
                            disabled={componentDiagramStatus !== FeatureStatus.ENABLED_DONE}
                            onNavigate={handleBeforeNavigate}
                        />
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

const CodeView = () => {
    return (
        <ReactFlowProvider>
            <LayoutFlow />
        </ReactFlowProvider>
    );
};

export default CodeView;
