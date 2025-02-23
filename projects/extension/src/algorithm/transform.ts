import { MarkerType } from "@xyflow/react";

import { AppNode } from "@shared/node.types";
import { Node, Group, Edge, GroupType } from "./model";
import { AppEdge } from "@shared/edge.types";
import { GLOBAL } from "./language";

/**
 * case 1: node => filePath.class / filePath
 * case 2: group => filePath.class
 * case 3: node in a node => filePath.class
 * @param {Node | Group | undefined} node
 */
function getEntityId(node: Node | Group | null): string {
  if (node instanceof Node) {
    const parent = node.parent;
    // case 1: points to node in file group
    if (parent instanceof Group && parent.groupType === GroupType.FILE) {
      return parent.filePath;
      // case 1: points to node in class/interface group
    } else if (parent instanceof Group) {
      return `${parent.filePath}.${parent.token}`;
      // case 3: points to node in node
    } else {
      return getEntityId(parent);
    }
  }

  if (node instanceof Group) {
    return `${node.filePath}.${node.token}`;
  }

  return "";
}

/**
 * Transform list of edges to a format suitable for ReactFlow
 * (1) Node -> Group
 * (2) Node -> Node
 */
export function transformEdges(allEdges: Edge[]): AppEdge[] {
  const output: AppEdge[] = [];
  for (const edge of allEdges) {
    if (edge.source.token === GLOBAL) {
      continue;
    }
    const source: string = getEntityId(edge.source);
    const target: string = getEntityId(edge.target);

    if (edge.target instanceof Node) {
      output.push({
        id: `${edge.source.token}-${edge.target.token}`,
        source,
        target,
        sourceHandle: edge.source.token,
        targetHandle: edge.target.token,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    } else if (edge.target instanceof Group) {
      output.push({
        id: `${edge.source.token}-${edge.target.token}`,
        source,
        target,
        sourceHandle: edge.source.token,
        targetHandle: "entity",
        markerEnd: { type: MarkerType.ArrowClosed },
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
      const fileGroupNodes = fileGroup.nodes.flatMap((node: Node) =>
        node.token !== GLOBAL
          ? [
              {
                name: node.token ?? "",
                lineNumber: node.lineNumber ?? 0,
                type: node.nodeType,
              },
            ]
          : []
      );

      if (fileGroupNodes.length > 0) {
        output.push({
          id: fileGroup.filePath ?? "",
          type: "entity",
          position: { x: 0, y: 0 },
          data: {
            entityName: fileGroup.token ?? "",
            entityType: "file",
            filePath: fileGroup.filePath ?? "",
            items: fileGroupNodes,
          },
        });
      }
    }
    for (const subgroup of fileGroup.subgroups) {
      const subgroupNodes = subgroup.nodes.flatMap((node: Node) => [
        {
          name: node.token ?? "",
          lineNumber: node.lineNumber ?? 0,
          type: node.nodeType,
        },
      ]);
      if (subgroup.token) {
        output.push({
          id: `${fileGroup.filePath}.${subgroup.token}`,
          type: "entity",
          position: { x: 0, y: 0 },
          data: {
            entityName: subgroup.token ?? "",
            entityType: subgroup.groupType,
            filePath: fileGroup.filePath ?? "",
            items: subgroupNodes,
          },
        });
      }
    }
  }
  return output;
}
