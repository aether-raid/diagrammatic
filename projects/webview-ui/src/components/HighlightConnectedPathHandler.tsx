import React, { useEffect } from "react";

import { NodeRow } from "@shared/app.types";
import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";
import { useReactFlow } from "@xyflow/react";
import { getEdgesEntitiesToHighlightBFS, getOutgoingEdgesFromEntityRow } from "../helpers/diagramBFS";

interface HighlightConnectedPathHandlerProps {
    hoveredEntity: NodeRow|undefined;
    setHighlightedEdges: React.Dispatch<React.SetStateAction<string[]>>;
    setHighlightedNodes: React.Dispatch<React.SetStateAction<string[]>>;
}

export const HighlightConnectedPathHandler = ({
    hoveredEntity,
    setHighlightedEdges,
    setHighlightedNodes,
}: HighlightConnectedPathHandlerProps) => {
    const { getNode, getEdges } = useReactFlow<AppNode, AppEdge>();

    useEffect(() => {
        // console.log("Currently hovering on: ", hoveredEntity);
        const edges = getEdges();

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
    }, [hoveredEntity]);

    return null;
};
