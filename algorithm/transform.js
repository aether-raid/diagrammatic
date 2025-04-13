import { GLOBAL } from "./language.js";
import { Node, Group, GroupType } from "./model.js";

/**
 * case 1: node => filePath.class / filePath
 * case 2: group => filePath.class
 * case 3: node in a node => filePath.class
 * @param {Node | Group | undefined} node
 */
function getEntityId(node) {
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

  // case 2: points to class/interface group directly
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
    const source = getEntityId(edge.source);
    const target = getEntityId(edge.target);

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
        targetHandle: "entity",
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
                startPosition: node.startPosition,
                endPosition: node.endPosition,
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
            sstartPosition: fileGroup.startPosition,
            endPosition: fileGroup.endPosition,
            entities: fileGroupNodes,
          },
        });
      }
    }

    for (const subgroup of fileGroup.allGroups()) {
      if (subgroup === fileGroup) {
        continue;
      }

      const subgroupNodes = subgroup.nodes.flatMap((node) => [
        {
          name: node.token ?? "",
          startPosition: node.startPosition,
          endPosition: node.endPosition,
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
            startPosition: subgroup.startPosition,
            endPosition: subgroup.endPosition,
            endLine: subgroup.endPosition.row ?? 0,
            entities: subgroupNodes,
          },
        });
      }
    }
  }
  return output;
}
