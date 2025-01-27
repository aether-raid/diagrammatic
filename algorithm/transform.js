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
export function transformFileGroups(fileGroups) {
  const output = [];
  for (const fileGroup of fileGroups) {
    if (fileGroup.nodes) {
      const fileGroupNodes = fileGroup.nodes.flatMap((node) =>
        node.token !== "(global)"
          ? [{ name: node.token ?? "", lineNumber: node.lineNumber ?? 0 }]
          : []
      );

      if (fileGroupNodes.length > 0) {
        output.push({
          id: fileGroup.token ?? "",
          type: "file",
          position: { x: 0, y: 0 },
          data: {
            fileName: fileGroup.token ?? "",
            filePath: fileGroup.filePath ?? "",
            lineNumber: 0,
            entities: fileGroupNodes,
          },
        });
      }
    }

    for (const subgroup of fileGroup.subgroups) {
      const subgroupNodes = subgroup.nodes.flatMap((node) => [
        { name: node.token ?? "", lineNumber: node.lineNumber ?? 0 },
      ]);
      if (subgroup.token) {
        output.push({
          id: subgroup.token ?? "",
          type: "class",
          position: { x: 0, y: 0 },
          data: {
            fileName: subgroup.token ?? "",
            filePath: fileGroup.filePath ?? "",
            lineNumber: subgroup.lineNumber ?? 0,
            entities: subgroupNodes,
          },
        });
      }
    }
  }
  return output;
}
