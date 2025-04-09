import { MarkerType } from '@xyflow/react';
import { getComponentDiagram } from '../componentDiagram/runComponentDiagramAlgorithm';
import { AppNode } from '@shared/node.types';
import { AppEdge } from '@shared/edge.types';
import { NodeEdgeData } from '@shared/app.types';
import { LLMProvider } from '../helpers/llm';
import { ComponentNodeInput, ComponentEdgeInput } from '../componentDiagram/types'; // Update path as needed

describe('Component Diagram Integration Tests', () => {
  // Create a mock LLM provider
  const mockLLMProvider: LLMProvider = {
    generateResponse: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should transform API response into nodes and edges', async () => {
    // Sample input data
    const inputData: NodeEdgeData = {
      nodes: [
        { 
          id: 'file1', 
          type: 'fileEntity', 
          position: { x: 0, y: 0 },
          data: { entityName: 'auth.js', description: 'Authentication module' } 
        },
        { 
          id: 'file2', 
          type: 'fileEntity', 
          position: { x: 100, y: 0 },
          data: { entityName: 'login.js', description: 'Login handler' } 
        },
        { 
          id: 'file3', 
          type: 'fileEntity', 
          position: { x: 200, y: 0 },
          data: { entityName: 'api.js', description: 'API utilities' } 
        }
      ],
      edges: [
        { id: 'e1-2', source: 'file1', target: 'file2', label: 'imports' },
        { id: 'e2-3', source: 'file2', target: 'file3', label: 'calls' }
      ]
    };

    // Mock LLM response that matches your types
    const mockComponents: ComponentNodeInput[] = [
      { 
        id: 1, 
        name: 'Auth Module', 
        description: 'Handles user authentication',
        files: ['auth.js', 'login.js']
      },
      { 
        id: 2, 
        name: 'API Service', 
        description: 'Manages API requests',
        files: ['api.js']
      }
    ];
    
    const mockRelationships: ComponentEdgeInput[] = [
      { 
        id: '1-2', 
        source: 1, 
        target: 2, 
        sourceName: 'Auth Module', 
        targetName: 'API Service', 
        type: 'calls' 
      }
    ];

    const mockLLMResponse = {
      components: mockComponents,
      'component relationships': mockRelationships
    };

    // Setup mock response
    (mockLLMProvider.generateResponse as jest.Mock).mockResolvedValueOnce(mockLLMResponse);

    // Call function
    const result = await getComponentDiagram(inputData, mockLLMProvider);

    // Verify LLM provider was called with correct parameters
    expect(mockLLMProvider.generateResponse).toHaveBeenCalledWith(
      expect.stringContaining('You are an AI'),
      expect.stringContaining('Group the file nodes into abstract functional components')
    );

    // Verify nodes were transformed correctly
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0]).toEqual({
      id: '1',
      type: 'componentEntity',
      position: { x: 0, y: 0 },
      data: {
        name: 'Auth Module',
        description: 'Handles user authentication',
        files: ['auth.js', 'login.js']
      }
    });

    // Verify edges were transformed correctly
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toEqual({
      id: '1-2',
      source: '1',
      target: '2',
      markerEnd: { type: MarkerType.ArrowClosed },
      label: 'calls'
    });
  });

  it('should handle empty input data', async () => {
    const emptyData: NodeEdgeData = { nodes: [], edges: [] };
    
    // Setup mock response for empty input
    (mockLLMProvider.generateResponse as jest.Mock).mockResolvedValueOnce({
      components: [],
      'component relationships': []
    });

    const result = await getComponentDiagram(emptyData, mockLLMProvider);
    
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('should handle errors from LLM provider', async () => {
    const inputData: NodeEdgeData = { 
      nodes: [{ id: 'test', type: 'fileEntity', position: { x: 0, y: 0 }, data: {} }], 
      edges: [] 
    };
    
    // Mock error from LLM provider
    (mockLLMProvider.generateResponse as jest.Mock).mockRejectedValueOnce(
      new Error('LLM API error')
    );

    // Create a spy on console.error before the function call
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Function should return empty components rather than throwing
    const result = await getComponentDiagram(inputData, mockLLMProvider);
    
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching component diagram:',
      expect.any(Error)
    );

    // Restore the original console.error
    consoleErrorSpy.mockRestore();
  });

  it('should convert node and edge IDs to strings', async () => {
    // Sample input data
    const inputData: NodeEdgeData = {
      nodes: [{ id: 'file1', type: 'fileEntity', position: { x: 0, y: 0 }, data: {} }],
      edges: []
    };

    // Mock LLM response with numeric IDs that match your types
    const mockLLMResponse = {
      components: [
        { 
          id: 123, 
          name: 'Test', 
          description: 'Test component', 
          files: ['file1'] 
        }
      ],
      'component relationships': [
        { 
          id: '123-456', 
          source: 123, 
          target: 456, 
          sourceName: 'Test',
          targetName: 'Other Component',
          type: 'calls' 
        }
      ]
    };

    (mockLLMProvider.generateResponse as jest.Mock).mockResolvedValueOnce(mockLLMResponse);

    const result = await getComponentDiagram(inputData, mockLLMProvider);
    
    // Check that IDs were converted to strings
    expect(result.nodes[0].id).toBe('123');
    expect(typeof result.nodes[0].id).toBe('string');
    
    expect(result.edges[0].source).toBe('123');
    expect(result.edges[0].target).toBe('456');
    expect(typeof result.edges[0].source).toBe('string');
    expect(typeof result.edges[0].target).toBe('string');
  });
});