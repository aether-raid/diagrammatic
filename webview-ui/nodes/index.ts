import { NodeTypes } from "@xyflow/react";

import { TextUpdaterNode } from "./components/TextUpdaterNode";
import { FileNode } from "./components/FileNode";
import { AppNode } from "@shared/node.types";


export const initialNodes: AppNode[] = [
  {
    id: '5',
    type: 'file',
    position: { x:0, y:0 },
    data: {
      fileName: 'Farm',
      entities: [
        { name: 'harvestPotato' },
        { name: 'harvestCorn' }
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
        { name: 'sellProduct' }
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
        { name: 'consumePotato' },
        { name: 'consumeCorn' }
      ]
    }
  }
];

export const nodeTypes = {
    'file': FileNode,
    'textUpdater': TextUpdaterNode
} satisfies NodeTypes;