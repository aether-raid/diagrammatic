import { getConnectedEdges } from "@xyflow/react";

import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";
import { NodeRow } from "@shared/app.types";


export const getOutgoingEdgesFromEntityRow = (node: AppNode, rowId: string, edges: AppEdge[]) => {
  const connectedEdges = getConnectedEdges([node], edges);
  const outgoingEdges = connectedEdges.filter(e =>
    (e.source === node.id)
    && (e.sourceHandle === rowId)
  );

  return outgoingEdges;
}

export const getEdgesEntitiesToHighlightBFS = (initialEdges: AppEdge[], globalEdges: AppEdge[], getNode: (id: string) => AppNode | undefined) => {
  // Treat edgesToExplore & entitiesToExplore as Queue objects (push & shift)
  let edgesToExplore = [...initialEdges];
  let entitiesToExplore: NodeRow[] = [];

  let exploredEntities: NodeRow[] = [];

  let edgesToHighlight = [...initialEdges];
  let entitiesToHighlight: NodeRow[] = [];

  while(edgesToExplore.length !== 0 || entitiesToExplore.length !== 0) {
    while(edgesToExplore.length !== 0) {
      const edge = edgesToExplore.shift()!; // Since length is not 0, can safely assume it will exist
      const targetEntity: NodeRow = {
        nodeId: edge.target,
        rowId: edge.targetHandle! // Safe to assume it exists
      }

      // Prevent infinite loops, ignore previously explored nodes
      if (!exploredEntities.some(e => e.nodeId === targetEntity.nodeId && e.rowId === targetEntity.rowId)) {
        exploredEntities.push(targetEntity);
        entitiesToExplore.push(targetEntity);
        entitiesToHighlight.push(targetEntity);
      }
    }

    while(entitiesToExplore.length !== 0) {
      const entity = entitiesToExplore.shift()!; // Since length is not 0, can safely assume it will exist
      const node = getNode(entity.nodeId)!; // Can safely assume it exists since it's part of the graph
      const outgoingEdges = getOutgoingEdgesFromEntityRow(node, entity.rowId, globalEdges);

      edgesToExplore.push(...outgoingEdges);
      edgesToHighlight.push(...outgoingEdges);
    }
  }

  return {
    edges: edgesToHighlight.map(e => e.id),
    entities: entitiesToHighlight.map(e => `${e.nodeId}-${e.rowId}`)
  }
};
