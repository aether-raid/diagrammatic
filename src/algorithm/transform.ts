import { AppNode } from "@shared/node.types";
import { Node, Group, Edge } from "./model";
import { AppEdge } from "@shared/edge.types";

/**
 * Transform list of edges to a format suitable for ReactFlow
 * (1) Node -> Group
 * (2) Node -> Node
 */
export function transformEdges(allEdges: Edge[]): AppEdge[] {
  const output: AppEdge[] = [];
  for (const edge of allEdges) {
    if (edge.target instanceof Node) {
      output.push({
        id: `${edge.source.token}-${edge.target.token}`,
        source: edge.source.parent?.token ?? "",
        target: edge.target.parent.token ?? "",
        sourceHandle: edge.source.token,
        targetHandle: edge.target.token,
        animated: true,
      });
    } else if (edge.target instanceof Group) {
      output.push({
        id: `${edge.source.token}-${edge.target.token}`,
        source: edge.source.parent?.token ?? "",
        target: edge.target.token ?? "",
        sourceHandle: edge.source.token,
        animated: true,
      });
    }
  }
  return output;
}

/**
 * Transform list of file groups to a format suitable for ReactFlow
 */
export function transformFileGroups(fileGroups: Group[]): AppNode[] {
  const output: AppNode[] = [];
  for (const fileGroup of fileGroups) {
    for (const subgroup of fileGroup.subgroups) {
      const entities = subgroup.nodes.flatMap((node) => [node.token ?? '']);
      output.push({
        id: subgroup.token ?? '',
        type: "file",
        position: { x: 0, y: 0 },
        data: {
          fileName: subgroup.token ?? '',
          entities,
        },
      });
    }
  }
  return output;
}
