import { getConnectedEdges } from "@xyflow/react";

import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";
import { NodeRow } from "@shared/app.types";


export const getOutgoingEdgesFromEntityRow = (node: AppNode, rowId: string, edges: AppEdge[]) => {
  const connectedEdges = getConnectedEdges([node], edges); // Safe assumption that node will never be undefined since an edge is there.
  const outgoingEdges = connectedEdges.filter(e =>
    (e.source === node.id)
    && (e.sourceHandle === rowId)
  );

  return outgoingEdges;
}

// TODO: Check against explored nodes in case there is a loop
export const getEdgesEntitiesToHighlightBFS = (initialEdges: AppEdge[], globalEdges: AppEdge[], getNode: (id: string) => AppNode | undefined) => {
  // console.log('Initial to explore: ', initialEdges);

  // Treat these "unexploredXX" arrays as Queue objects (push & shift)
  let unexploredEdges = [...initialEdges];
  let unexploredEntities: NodeRow[] = [];

  let edgesToHighlight = [...initialEdges];
  let entitiesToHighlight: NodeRow[] = [];

  while(unexploredEdges.length !== 0 || unexploredEntities.length !== 0) {
    while(unexploredEdges.length !== 0) {
      const edge = unexploredEdges.shift()!; // Since length is not 0, can safely assume it will exist
      const targetEntity: NodeRow = {
        nodeId: edge.target,
        rowId: edge.targetHandle! // Safe to assume it exists
      }

      unexploredEntities.push(targetEntity);
      entitiesToHighlight.push(targetEntity);
    }

    while(unexploredEntities.length !== 0) {
      const entity = unexploredEntities.shift()!; // Since length is not 0, can safely assume it will exist
      const node = getNode(entity.nodeId)!; // Can safely assume it exists since it's part of the graph
      const outgoingEdges = getOutgoingEdgesFromEntityRow(node, entity.rowId, globalEdges);

      unexploredEdges.push(...outgoingEdges);
      edgesToHighlight.push(...outgoingEdges);
    }
  }

  return {
    edges: edgesToHighlight.map(e => e.id),
    entities: entitiesToHighlight.map(e => `${e.nodeId}-${e.rowId}`)
  }
};
