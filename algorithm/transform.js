import { GLOBAL } from "./language.js";
import { Node, Group, GroupType } from "./model.js";

/**
 * case 1: node
 * case 2: group but not file
 * @param {} node
 */
function getFilePath(node) {
  if (node instanceof Node) {
    const parent = node.parent;
    if (parent instanceof Group && parent.groupType === GroupType.FILE) {
      return parent.filePath;
    } else {
      return `${parent.filePath}.${parent.token}`;
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
export function transformEdges(allEdges) {
  const output = [];
  for (const edge of allEdges) {
    if (edge.source.token === GLOBAL) {
      continue;
    }
    const source = getFilePath(edge.source);
    const target = getFilePath(edge.target);

    if (edge.target instanceof Node) {
      output.push({
        id: `${edge.source.token}-${edge.target.token}`,
        source,
        target,
        sourceHandle: edge.source.token,
        targetHandle: edge.target.token,
        animated: true,
      });
    } else if (edge.target instanceof Group) {
      output.push({
        id: `${edge.source.token}-${edge.target.token}`,
        source,
        target,
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
        {
          name: node.token ?? "",
          lineNumber: node.lineNumber ?? 0,
          type: node.nodeType,
        },
      ]);
      if (subgroup.token) {
        output.push({
          id: `${fileGroup.filePath}.${subgroup.token}`,
          type: subgroup.groupType,
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
