// *********************************
// Layout using Dagre.js
// *********************************

import Dagre from '@dagrejs/dagre';
import { Background, Controls, getConnectedEdges, MiniMap, Panel, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css'; // Must import this, else React Flow will not work!

import { HoveredEntity } from '@shared/app.types';
import { AppNode } from '@shared/node.types';
import { AppEdge } from '@shared/edge.types';
import { AcceptNodeEdgeDataPayload, Commands, WebviewCommandMessage } from '@shared/message.types';

import { initialNodes, nodeTypes } from './nodes';
import { initialEdges } from './edges';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sendReadyMessageToExtension } from './messageHandler';


interface OptionProps {
    direction: string;
}

const getLayoutedElements = (nodes: AppNode[], edges: AppEdge[], options: OptionProps) => {
    const g = new Dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: options.direction });

    edges.forEach(edge => g.setEdge(edge.source, edge.target));
    nodes.forEach(node => g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
    }));

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
          const position = g.node(node.id);
          
          // Shift the dagre node anchor point (center-center)
          // to match the React Flow node anchor point (top-left).
          const x = position.x - (node.measured?.width ?? 0) / 2;
          const y = position.y - (node.measured?.height ?? 0) / 2;
    
          return { ...node, position: { x, y } };
        }),
        edges,
    };
}

const LayoutFlow = () => {
    const vscode = useRef<any>(null);
    const { getNode } = useReactFlow();

    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
    const [hoveredEntity, setHoveredEntity] = useState<HoveredEntity | undefined>(undefined);

    useEffect(() => {
        // Setup message listener
        const onMessage = (event: MessageEvent<WebviewCommandMessage>) => {
            const { command, message } = event.data;

            // TODO: Refactor this into a non switch-case if possible
            switch (command) {
              case Commands.ACCEPT_NODE_EDGE_DATA:
                const msg = message as AcceptNodeEdgeDataPayload;
                setNodes(msg.nodes);
                setEdges(msg.edges);
                break;
            }
        };

        window.addEventListener('message', onMessage);

        // Send message to inform extension that webview is ready to receive data.
        if (!vscode.current) {
            try {
                // @ts-ignore: Expected, part of native VSCode API.
                vscode.current = acquireVsCodeApi();
                sendReadyMessageToExtension(vscode.current);
            } catch (error) {
                if ((error as Error).message !== 'acquireVsCodeApi is not defined') {
                    // Only catch the above error, throw all else
                    throw error;
                }
            }
        }

        return () => {
            // Remove event listener on component unmount
            window.removeEventListener('message', onMessage);
        }
    }, []);

    const onLayout = useCallback((direction: string) => {
        console.log(nodes);
        const layouted = getLayoutedElements(nodes, edges, { direction });

        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);

        // Re-fit the viewport to the new graph
        window.requestAnimationFrame(() => { fitView() }); 
    }, [nodes, edges]);

    // TODO: Refactor & properly name variables
    // TODO: Check against explored nodes in case there is a loop
    const exploreFlowBFS = (initialEdges: AppEdge[]) => {
      console.log('Initial to explore: ', initialEdges);

      let unexploredEdges = [...initialEdges];
      let unexploredEntities: string[][] = [];
      let edgesToHighlight = [...initialEdges];
      let entitiesToHighlight: string[][] = [];

      while(unexploredEdges.length !== 0 || unexploredEntities.length !== 0) {
        while(unexploredEdges.length !== 0) {
          const edge = unexploredEdges.shift()!; // Since length is not 0, can safely assume it will exist
          console.log(edge.target, edge.targetHandle);
          unexploredEntities.push([edge.target, edge.targetHandle!]);
          entitiesToHighlight.push([edge.target, edge.targetHandle!]);
        }

        while(unexploredEntities.length !== 0) {
          const entity = unexploredEntities.shift()!; // Since length is not 0, can safely assume it will exist
          const node = getNode(entity[0]);
          let connectedEdges = getConnectedEdges([node!], edges); // Safe assumption that node will never be undefined since an edge is there.

          connectedEdges = connectedEdges.filter(e =>
            (e.source === entity[0])
            && (e.sourceHandle === entity[1])
          );

          unexploredEdges.push(...connectedEdges);
          edgesToHighlight.push(...connectedEdges);
        }
      }

      return {
        edgesToHighlight: edgesToHighlight.map(e => e.id),
        entitiesToHighlight: entitiesToHighlight.map(e => `${e[0]}-${e[1]}`)
      }
    };

    useEffect(() => {
      // console.log("Currently hovering on: ", hoveredEntity);
      if (!hoveredEntity) {
        setHighlightedNodes([]);
        setHighlightedEdges([]);
        return;
      }

      const hoveredNode = getNode(hoveredEntity.nodeId);
      if (!hoveredNode) { return; }

      let connectedEdges = getConnectedEdges([hoveredNode], edges);
      connectedEdges = connectedEdges.filter(e =>
        (e.source === hoveredEntity.nodeId)
        && (e.sourceHandle === hoveredEntity.rowId)
      );

      const bfsResult = exploreFlowBFS(connectedEdges);
      setHighlightedEdges(bfsResult.edgesToHighlight);

      const entityRepr = `${hoveredEntity.nodeId}-${hoveredEntity.rowId}`;
      setHighlightedNodes([entityRepr, ...bfsResult.entitiesToHighlight]);
    }, [hoveredEntity]);

    const prepareNode = (node: AppNode) => (node.type !== 'file' ? node : {
      ...node,
      data: {
        ...node.data,
        entities: node.data.entities.map(entity => {
          entity.highlighted = highlightedNodes.includes(`${node.id}-${entity.name}`);
          return entity;
        }),
        setHoveredEntity
      }
    });

    const prepareEdge = (edge: AppEdge) => ({
      ...edge,
      className: highlightedEdges.includes(edge.id) ? 'highlighted-edge' : ''
    });

    return (
        <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes.map(n => prepareNode(n))}
            edges={edges.map(e => prepareEdge(e))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            colorMode='dark'
        >
            <Panel position='top-center'>
                <button onClick={() => onLayout('TB')}>Vertical Layout</button>
                <button onClick={() => onLayout('LR')}>Horizontal Layout</button>
            </Panel>
            <MiniMap />
            <Controls />
            <Background />
        </ReactFlow>
    )
}


const Flow = () => {
    return (
        <ReactFlowProvider>
            <LayoutFlow />
        </ReactFlowProvider>
    );
};

export default Flow;
