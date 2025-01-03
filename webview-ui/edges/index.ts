import { EdgeTypes } from "@xyflow/react";

import { AppEdge } from "@shared/edge.types";

import { CustomEdge } from "./CustomEdge";


export const initialEdges: AppEdge[] = [
    { id: '1-2', source: '1', target: '2', animated: true },
    { id: '1-3', source: '1', target: '3', animated: true },
    { id: '2-2a', source: '2', target: '2a', animated: true },
    { id: '2a-2b', source: '2a', target: '2b', animated: true },
    { id: '2a-2c', source: '2a', target: '2c', animated: true },
    { id: '2a-2d', source: '2a', target: '2d', animated: true },
    { id: '2d-2e', source: '2d', target: '2e', animated: true },

    { id: '5-6a', source: '5', target: '6', sourceHandle: 'harvestPotato', animated: true },
    { id: '5-6b', source: '5', target: '6', sourceHandle: 'harvestCorn', animated: true },
    { id: '6-7a', source: '6', target: '7', targetHandle: 'consumePotato', animated: true },
    { id: '6-7b', source: '6', target: '7', targetHandle: 'consumeCorn', animated: true }
];

export const edgeTypes = {
    'customEdge': CustomEdge
} satisfies EdgeTypes;