import { NodeTypes } from "@xyflow/react";

import { TextUpdaterNode } from "./TextUpdaterNode";
import { AppNode } from "./types";


export const initialNodes: AppNode[] = [
    { 
        id: '1',
        position: { x:0, y:0 },
        data: { label: 'Entry'},
        type: 'input'
    },
    {
        id: '2',
        position: { x:0, y:0 },
        data: { label: 'Node 2' }
    },
    {
        id: '2a',
        position: { x:0, y:0 },
        data: { label: 'Node 2A' }
    },
    {
        id: '2b',
        position: { x:0, y:0 },
        data: { label: 'Node 2B' }
    },
    {
        id: '2c',
        position: { x:0, y:0 },
        data: { label: 'Node 2C' }
    },
    {
        id: '2d',
        position: { x:0, y:0 },
        data: { label: 'Node 2D' }
    },
    {
        id: '2e',
        position: { x:0, y:0 },
        data: { label: 'Node 2E' }
    },
    {
        id: '3',
        position: { x:0, y:0 },
        data: { label: 'Node 3' }
    },
    {
        id: '4',
        type: 'textUpdater',
        position: { x:0, y:0 },
        data: {}
    }
];

export const nodeTypes = {
    'textUpdater': TextUpdaterNode
} satisfies NodeTypes;