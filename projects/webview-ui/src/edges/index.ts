import { EdgeTypes, MarkerType } from "@xyflow/react";

import { AppEdge } from "@shared/edge.types";

import { CustomEdge } from "./CustomEdge";

import { CompEdge } from "@shared/compEdge.types";

export const initialEdges: AppEdge[] = [
    { id: '5-5a', source: '5', target: '5a', sourceHandle: 'Planter', targetHandle: 'entity', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: '5-5b', source: '5', target: '5b', sourceHandle: 'Harvester', targetHandle: 'entity', markerEnd: { type: MarkerType.ArrowClosed } },
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

export const initialCompEdges: CompEdge[] = [
    {id: '0-4', source: '0', target: '4', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '1-4', source: '1', target: '4', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '2-4', source: '2', target: '4', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '3-4', source: '3', target: '4', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '0-3', source: '0', target: '3', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '1-3', source: '1', target: '3', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '5-0', source: '5', target: '0', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '5-1', source: '5', target: '1', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '5-2', source: '5', target: '2', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '5-3', source: '5', target: '3', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
    {id: '5-4', source: '5', target: '4', sourceHandle: 'comp', targetHandle: 'comp', markerEnd: {type: MarkerType.ArrowClosed}},
]