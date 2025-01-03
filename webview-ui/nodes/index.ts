import { NodeTypes } from "@xyflow/react";

import { TextUpdaterNode } from "./components/TextUpdaterNode";
import { FileNode } from "./components/FileNode";
import { AppNode } from "@shared/node.types";


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
        id: '4',
        type: 'textUpdater',
        position: { x:0, y:0 },
        data: {}
    },
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
];

export const nodeTypes = {
    'file': FileNode,
    'textUpdater': TextUpdaterNode
} satisfies NodeTypes;