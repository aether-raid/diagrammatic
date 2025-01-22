import { EdgeTypes, MarkerType } from "@xyflow/react";

import { AppEdge } from "@shared/edge.types";

import { CustomEdge } from "./CustomEdge";


export const initialEdges: AppEdge[] = [
    { id: '5b-6-1', source: '5b', target: '6', sourceHandle: 'harvestPotato', targetHandle: 'sellProduct', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: '5b-6-2', source: '5b', target: '6', sourceHandle: 'harvestCorn', targetHandle: 'sellProduct', markerEnd: { type: MarkerType.ArrowClosed }  },
    { id: '5b-8b', source: '5b', target: '8', sourceHandle: 'harvestCarrot', targetHandle: 'cookAndGiveDish', markerEnd: { type: MarkerType.ArrowClosed }  },
    { id: '6-7a', source: '6', target: '7', sourceHandle: 'sellProduct', targetHandle: 'consumePotato', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: '6-7b', source: '6', target: '7', sourceHandle: 'sellProduct', targetHandle: 'consumeCorn', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: '7-8a', source: '7', target: '8', sourceHandle: 'consumePotato', targetHandle: 'cookAndGiveDish', markerEnd: { type: MarkerType.ArrowClosed } }
];

export const edgeTypes = {
    'customEdge': CustomEdge
} satisfies EdgeTypes;