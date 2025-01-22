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
      items: [
        { name: 'Planter' },
        { name: 'Harvester' },
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
      items: [
        { name: 'plantPotato' },
        { name: 'plantCorn' },
        { name: 'plantCarrot' }
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
      items: [
        { name: 'harvestPotato' },
        { name: 'harvestCorn' },
        { name: 'harvestCarrot' }
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
      items: [
        { name: 'sellProduct' }
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
      items: [
        { name: 'consumePotato' },
        { name: 'consumeCorn' }
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
      items: [
        { name: 'givePotato' },
        { name: 'giveCorn' },
        { name: 'cookAndGiveDish' }
      ]
    }
  }
];

export const nodeTypes = {
    'entity': EntityNode,
    'textUpdater': TextUpdaterNode
} satisfies NodeTypes;