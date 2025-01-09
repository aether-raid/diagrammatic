import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";

import { NodeEdgeData } from "./extension.types";
import { MarkerType } from "@xyflow/react";


const getCode = (): string => {
  return 'code should be returned here!';
}

const executeAlgorithm = (code: string): any => {
  return 'arbitrary format';
}

const transformToNodeEdgeFormat = (data: any): NodeEdgeData => {
  // Replace nodes/edges with the actual ones
  const nodes: AppNode[] = [
    {
      id: '5',
      type: 'file',
      position: { x:0, y:0 },
      data: {
        fileName: 'Farm',
        entities: [
          'harvestPotato',
          'harvestCorn'
        ]
      }
    },
    {
      id: '6',
      type: 'file',
      position: { x:0, y:0 },
      data: {
        fileName: 'Grocer',
        entities: [
          'sellProduct'
        ]
      }
    },
    {
      id: '7',
      type: 'file',
      position: { x:0, y:0 },
      data: {
        fileName: 'Customer',
        entities: [
          'consumePotato',
          'consumeCorn'
        ]
      }
    }
  ]

  const edges: AppEdge[] = [
    { id: '5-6a', source: '5', target: '6', sourceHandle: 'harvestPotato', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: '5-6b', source: '5', target: '6', sourceHandle: 'harvestCorn', markerEnd: { type: MarkerType.ArrowClosed }  },
    { id: '6-7a', source: '6', target: '7', targetHandle: 'consumePotato', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: '6-7b', source: '6', target: '7', targetHandle: 'consumeCorn', markerEnd: { type: MarkerType.ArrowClosed } }
  ];

  return {
    nodes,
    edges
  }
}

export const runCodeToDiagramAlgorithm = (): NodeEdgeData => {
  const code = getCode();
  const intermediateFormat = executeAlgorithm(code);
  const nodeEdgeFormat = transformToNodeEdgeFormat(intermediateFormat);

  return nodeEdgeFormat;
};
