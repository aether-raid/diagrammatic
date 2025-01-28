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
    if (fileGroup.nodes) {
      const fileGroupNodes = fileGroup.nodes.flatMap((node: Node) => [
        { name: node.token ?? "", lineNumber: node.lineNumber ?? 0 },
      ]);

      output.push({
        id: fileGroup.token ?? "",
        type: 'entity' as any,
        position: { x: 0, y: 0 },
        data: {
          entityName: fileGroup.token ?? "",
          entityType: 'file',
          filePath: fileGroup.filePath ?? "",
          items: fileGroupNodes,
        },
      });
    }
    for (const subgroup of fileGroup.subgroups) {
      const subgroupNodes = subgroup.nodes.flatMap((node: Node) => [
        { name: node.token ?? "", lineNumber: node.lineNumber ?? 0 },
      ]);
      output.push({
        id: subgroup.token ?? "",
        type: 'entity' as any,
        position: { x: 0, y: 0 },
        data: {
          entityName: subgroup.token ?? "",
          entityType: 'class',
          filePath: fileGroup.filePath ?? "",
          items: subgroupNodes,
        },
      });
    }
  }
  return output;
}
