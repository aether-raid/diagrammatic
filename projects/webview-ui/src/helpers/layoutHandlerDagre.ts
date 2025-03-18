import Dagre from "@dagrejs/dagre";

import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";

interface OptionProps {
  direction: string;
}

export const getLayoutedElements = (
    nodes: AppNode[],
    edges: AppEdge[],
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
