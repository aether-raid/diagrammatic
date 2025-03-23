import { useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";

import { useDiagramContext } from "../contexts/DiagramContext";
import { retainNodePositions } from "../helpers/nodePositionHandler";
import { ViewType } from "../App.types";


export const ViewChangeHandler = () => {
    const { getNodes, setEdges, setNodes, setViewport } = useReactFlow<AppNode, AppEdge>();
    const diagramCtx = useDiagramContext(ViewType.CODE_VIEW);

    const nodes = getNodes();

    // Stable Reference to node variable
    const nodesRef = useRef(nodes);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    useEffect(() => {
        if (!diagramCtx?.graphData) {
            console.error("Unable to retrieve graph data from context");
            return;
        }

        setNodes(retainNodePositions(diagramCtx.graphData.nodes, nodesRef.current));
        setEdges(diagramCtx.graphData.edges);
    }, [diagramCtx?.graphData]);

    useEffect(() => {
        if (!diagramCtx?.viewport) {
            console.error("Unable to retrieve viewport from context");
            return;
        }
        setViewport(diagramCtx.viewport);
    }, [diagramCtx?.viewport, setViewport]);

    return null;
}
