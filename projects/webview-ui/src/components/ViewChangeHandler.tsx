import { useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";

import { useDiagramContext } from "../contexts/DiagramContext";
import { retainNodePositions } from "../helpers/nodePositionHandler";


export const ViewChangeHandler = () => {
    const { getNodes, setEdges, setNodes, setViewport } = useReactFlow<AppNode, AppEdge>();
    const diagramCtx = useDiagramContext();

    const nodes = getNodes();

    // Stable Reference to node variable
    const nodesRef = useRef(nodes);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    useEffect(() => {
        if (!diagramCtx?.codeView.graphData) {
            console.error("Unable to retrieve graph data from context");
            return;
        }

        setNodes(retainNodePositions(diagramCtx.codeView.graphData.nodes, nodesRef.current));
        setEdges(diagramCtx.codeView.graphData.edges);
    }, [diagramCtx?.codeView.graphData]);

    useEffect(() => {
        if (!diagramCtx?.codeView.viewport) {
            console.error("Unable to retrieve viewport from context");
            return;
        }
        setViewport(diagramCtx.codeView.viewport);
    }, [diagramCtx?.codeView.viewport, setViewport]);

    return null;
}
