import { NodeTypes } from "@xyflow/react";

import { TextUpdaterNode } from "./components/TextUpdaterNode";
import { EntityNode } from "./components/EntityNode";
import { AppNode } from "@shared/node.types";


export const initialNodes: AppNode[] = [
  {
    id: '5',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Farm',
      entityType: 'file',
      filePath: 'path/to/farm',
      items: [
        { name: 'Planter', lineNumber: 15 },
        { name: 'Harvester', lineNumber: 45 },
      ]
    }
  },
  {
    id: '5a',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Planter',
      entityType: 'class',
      filePath: 'path/to/planter',
      items: [
        { name: 'plantPotato', lineNumber: 0 },
        { name: 'plantCorn', lineNumber: 20 },
        { name: 'plantCarrot', lineNumber: 40 }
      ]
    }
  },
  {
    id: '5b',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Harvester',
      entityType: 'class',
      filePath: 'path/to/harvester',
      items: [
        { name: 'harvestPotato', lineNumber: 0 },
        { name: 'harvestCorn', lineNumber: 20 },
        { name: 'harvestCarrot', lineNumber: 40 }
      ]
    }
  },
  {
    id: '6',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Grocer',
      entityType: 'file',
      filePath: 'path/to/grocer',
      items: [
        { name: 'sellProduct', lineNumber: 0 }
      ]
    }
  },
  {
    id: '7',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Customer',
      entityType: 'file',
      filePath: 'path/to/customer',
      items: [
        { name: 'consumePotato', lineNumber: 15 },
        { name: 'consumeCorn', lineNumber: 36 }
      ]
    }
  },
  {
    id: '8',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Gift',
      entityType: 'file',
      filePath: 'path/to/gift',
      items: [
        { name: 'givePotato', lineNumber: 0 },
        { name: 'giveCorn', lineNumber: 32 },
        { name: 'cookAndGiveDish', lineNumber: 77 }
      ]
    }
  }
];

export const nodeTypes = {
    'entity': EntityNode,
    'textUpdater': TextUpdaterNode
} satisfies NodeTypes;