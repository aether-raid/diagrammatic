import { useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";

import { useDiagramContext } from "../contexts/DiagramContext";

import { ViewType } from "../App.types";
import { retainNodePositions } from "../helpers/nodePositionHandler";
import { compareNodeArrays } from "../helpers/nodeComparisonHandler";

interface ViewChangeHandlerProps {
    view: ViewType;
    handleLayout: (direction: string) => void;
}

export const ViewChangeHandler = ({ view, handleLayout }: ViewChangeHandlerProps) => {
    const { getNodes, setEdges, setNodes, setViewport } = useReactFlow<AppNode, AppEdge>();
    const diagramCtx = useDiagramContext(view);

    const initialLayoutApplied = useRef<boolean>(false);

    useEffect(() => {
        // console.log(`${view}| effect ran, initLayoutApplied:`, initialLayoutApplied.current);
        if (initialLayoutApplied.current) return;

        const nodes = getNodes();
        const allMeasured = nodes.every(node => node.measured?.height && node.measured?.width);
        const isNodesSameAsCtx = compareNodeArrays(diagramCtx?.graphData?.nodes ?? [], nodes);
        // console.log(`${view}| \nnodes:`, nodes, "\nctx nodes: ", diagramCtx?.graphData?.nodes, "\nisNodesSameAsCtx:", isNodesSameAsCtx, "\nallMeasured:", allMeasured);
        if (!allMeasured || !isNodesSameAsCtx) return;

        handleLayout("LR");
        // console.log(`${view}| layout applied`);
        initialLayoutApplied.current = true;
    }, [getNodes()]);

    useEffect(() => {
        if (!diagramCtx?.graphData) {
            console.error("Unable to retrieve graph data from context");
            return;
        }

        const nodes = getNodes();
        setNodes(retainNodePositions(diagramCtx.graphData.nodes, nodes));
        setEdges(diagramCtx.graphData.edges);

        // console.log(`${view} | \nwhile setting graph data, data is touched?:`, diagramCtx.graphData.isTouched);
        initialLayoutApplied.current = diagramCtx.graphData.isTouched;
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
