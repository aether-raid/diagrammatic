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
import { CompNode } from '@shared/compNode.types';
import { CompEdge } from '@shared/compEdge.types';
import { initialCompNodes, nodeTypes } from "./nodes";
import { initialCompEdges } from "./edges";
import { useCallback } from "react";
// import HomeButton from "./buttons/HomeButton";

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
}

const LayoutFlow = () => {
    const { fitView } = useReactFlow<CompNode, CompEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialCompNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialCompEdges);

    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 2;

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

    const prepareNode = (node: CompNode) =>
        node.type !== "comp"
            ? node
            : {
                ...node,
                data: {
                    ...node.data,
                },
            };

    const prepareEdge = (edge: CompEdge) => ({
        ...edge,
    });
    edges.forEach((e) => console.log("Prepared Edge:", prepareEdge(e)));

    return (
        <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes.map((n) => prepareNode(n))}
            edges={edges.map((e) => prepareEdge(e))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
            {/* <DownloadButton minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} /> */}
            {/* <HomeButton /> TO FIX THIS */}
            <Background />
        </ReactFlow>
    );
};

const CompView = () => {
    return (
        <ReactFlowProvider>
            <LayoutFlow />
        </ReactFlowProvider>
    )
}

export default CompView;