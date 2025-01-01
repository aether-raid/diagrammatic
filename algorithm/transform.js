import { Node, Group } from "./model.js";

/**
 * Transform list of edges to a format suitable for ReactFlow
 * (1) Node -> Group
 * (2) Node -> Node
 */
export function transformEdges(allEdges) {
  const output = [];
  for (const edge of allEdges) {
    if (edge.target instanceof Node) {
      output.push({
        id: `${edge.source.token}-${edge.target.token}`,
        source: edge.source.parent.token,
        target: edge.target.parent.token,
        sourceHandle: edge.source.token,
        targetHandle: edge.target.token,
        animated: true,
      });
    } else if (edge.target instanceof Group) {
      output.push({
        id: `${edge.source.token}-${edge.target.token}`,
        source: edge.source.parent.token,
        target: edge.target.token,
        sourceHandle: edge.source.token,
        animated: true,
      });
    }
  }
  return output;
}
