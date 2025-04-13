import { AppNode } from "@shared/node.types";

export const compareNodeArrays = (nodesA: AppNode[], nodesB: AppNode[]) => {
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
