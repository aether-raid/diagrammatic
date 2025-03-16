import { AppNode } from "@shared/node.types";

const compareNodeArrays = (nodesA: AppNode[], nodesB: AppNode[]) => {
  const idsA = new Set(nodesA.map(node => node.id));
  const idsB = new Set(nodesB.map(node => node.id));

  if (idsA.size !== idsB.size) {
    return false;
  }

  for (let id of idsA) {
    if (!idsB.has(id)) {
      return false;
    }
  }

  return true;
}

const copyPositionToOtherNodeArray = (target: AppNode[], source: AppNode[]) => {
  // Use Map for lookup optimization
  const sourceMap = new Map(source.map(node => [node.id, node]));

  const updatedTarget = target.map(node => {
    const matchedSource = sourceMap.get(node.id);
    if (matchedSource) {
      console.log("found position: ", matchedSource.position);
      return { ...node, position: matchedSource.position };
    }

    // Shouldn't happen, but just in case ig?
    return node;
  })

  console.log(updatedTarget);
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
