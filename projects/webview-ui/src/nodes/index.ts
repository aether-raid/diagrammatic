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
      description: 'This file serves as a central entity that manages multiple agricultural components. It coordinates the planting & harvesting processes.',
      entityName: 'Farm',
      entityType: 'file',
      filePath: 'path/to/farm',
      items: [
        { name: 'Planter', lineNumber: 15 },
        { name: 'Harvester', lineNumber: 45 },
      ],
    security: {
        clean: [],
        vulnerability: [{ range: {
          start: {
            line: 26,
            character: 32,
          },
          end: {
            line: 3,
            character: 3,
          }
        }, message: 'Variable Assigned to Object Injection Sink', severity: 1, source: 'Group: security' }],
        extras: []
    }
    }
  },
  {
    id: '5a',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      description: 'This class is responsible for crop planting. It encapsulates the various functions required to plant crops.',
      entityName: 'Planter',
      entityType: 'class',
      filePath: 'path/to/planter',
      items: [
        { name: 'plantPotato', lineNumber: 0 },
        { name: 'plantCorn', lineNumber: 20 },
        { name: 'plantCarrot', lineNumber: 40 }
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
    }
  },
  {
    id: '5b',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      description: 'This class is responsible for harvesting crops once they are ready. It encapsulates the various functions required to harvest different crops.',
      entityName: 'Harvester',
      entityType: 'class',
      filePath: 'path/to/harvester',
      items: [
        { name: 'harvestPotato', lineNumber: 0 },
        { name: 'harvestCorn', lineNumber: 20 },
        { name: 'harvestCarrot', lineNumber: 40 }
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
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
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
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
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
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
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
    }
  },
  {
    id: '9',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Food',
      entityType: 'interface',
      filePath: 'path/to/food',
      items: [
        { name: 'eatPotato', lineNumber: 0 },
        { name: 'eatCorn', lineNumber: 32 },
      ]
    }
  },
  {
    id: '10',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Bin',
      entityType: 'namespace',
      filePath: 'path/to/bin',
      items: [
        { name: 'yeetPotato', lineNumber: 0 },
        { name: 'yeetCorn', lineNumber: 32 },
      ]
    }
  },
  {
    id: '11',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Bin',
      entityType: 'struct',
      filePath: 'path/to/bin',
      items: [
        { name: 'structPotato', lineNumber: 0 },
        { name: 'structCorn', lineNumber: 32 },
      ]
    }
  }
];

export const nodeTypes = {
    'entity': EntityNode,
    'textUpdater': TextUpdaterNode
} satisfies NodeTypes;