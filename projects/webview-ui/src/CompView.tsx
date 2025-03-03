import "@xyflow/react/dist/style.css"; // Must import this, else React Flow will not work!
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
import { CompNode } from "@shared/compNode.types";
import { CompEdge } from "@shared/compEdge.types";
import {
    AcceptCompNodeEdgeDataPayload,
    Commands,
    WebviewCommandMessage,
} from "@shared/message.types";
import { initialCompNodes, nodeTypes } from "./nodes";
import { initialCompEdges } from "./edges";
import { useCallback, useEffect, useState } from "react";
import HomeButton from "./components/HomeButton";
import { sendReadyMessageToExtension } from "./helpers/vscodeApiHandler";
import DownloadButton from "./components/DownloadButton";

interface OptionProps {
    direction: string;
}

const getLayoutedElements = (
    nodes: CompNode[],
    edges: CompEdge[],
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
    const { fitView } = useReactFlow<CompNode, CompEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialCompNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialCompEdges);
    // Hover Highlighting states
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
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
        // Setup message listener
        const onMessage = (event: MessageEvent<WebviewCommandMessage>) => {
            const { command, message } = event.data;
            // TODO: Refactor this into a non switch-case if possible
            switch (command) {
                case Commands.COMPONENT_DIAGRAM: {
                    const msg = message as AcceptCompNodeEdgeDataPayload;
                    setNodes(msg.compNodes);
                    setEdges(msg.compEdges);
                    break;
                }
            }
        };

        window.addEventListener("message", onMessage);

        try {
            sendReadyMessageToExtension();
        } catch (error) {
            if (
                (error as Error).message !== "acquireVsCodeApi is not defined"
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

    const prepareNode = (node: CompNode) =>
        node.type !== "comp"
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

    const prepareEdge = (edge: CompEdge) => ({
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
            <DownloadButton minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
            <HomeButton />
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
