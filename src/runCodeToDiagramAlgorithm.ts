import { NodeEdgeData } from "./extension.types";

const getCode = (): string => {
  return 'code should be returned here!';
}

const executeAlgorithm = (code: string): any => {
  return 'arbitrary format';
}

const transformToNodeEdgeFormat = (data: any): NodeEdgeData => {
  // Replace nodes/edges with the actual ones
  const nodes = [
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

  const edges = [
    { id: '5-6a', source: '5', target: '6', sourceHandle: 'harvestPotato', animated: true },
    { id: '5-6b', source: '5', target: '6', sourceHandle: 'harvestCorn', animated: true },
    { id: '6-7a', source: '6', target: '7', targetHandle: 'consumePotato', animated: true },
    { id: '6-7b', source: '6', target: '7', targetHandle: 'consumeCorn', animated: true }
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
