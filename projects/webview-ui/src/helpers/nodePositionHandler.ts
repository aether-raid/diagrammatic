import { AppNode } from "@shared/node.types";

import { compareNodeArrays } from "./nodeComparisonHandler";

const copyPositionToOtherNodeArray = (target: AppNode[], source: AppNode[]) => {
  // Use Map for lookup optimization
  const sourceMap = new Map(source.map(node => [node.id, node]));

  const updatedTarget = target.map(node => {
    const matchedSource = sourceMap.get(node.id);
    if (matchedSource) {
      return { ...node, position: matchedSource.position };
    }

    // Shouldn't happen, but just in case ig?
    return node;
  })

  return updatedTarget;
}

export const retainNodePositions = (newNodes: AppNode[], oldNodes: AppNode[]) => {
  // Only retain positions if the nodes are the exact same
  const isSameNodes = compareNodeArrays(newNodes, oldNodes);
  if (!isSameNodes) {
    return newNodes;
  }

  return copyPositionToOtherNodeArray(newNodes, oldNodes);
};
