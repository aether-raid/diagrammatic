// *********************************
// Layout using Dagre.js
// *********************************

import Dagre from '@dagrejs/dagre';
import { Background, Controls, MiniMap, Panel, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css'; // Must import this, else React Flow will not work!

import { initialNodes, nodeTypes } from './nodes';
import { initialEdges } from './edges';
import { AppNode } from './nodes/types';
import { AppEdge } from './edges/types';
import { useCallback, useEffect, useRef } from 'react';
import { WebviewMessage } from './App.types';


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

    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        // Setup message listener
        const onMessage = (event: MessageEvent<WebviewMessage>) => {
            const { command, message } = event.data;
            console.log('recv:', command, message);

            // TODO: Refactor this into a non switch-case if possible
            switch (command) {
              case 'accept-node-edge-data':
                console.log('accepted, changing NE-data');
                setNodes(message.nodes);
                setEdges(message.edges);
                break;
            }
        };

        window.addEventListener('message', onMessage);

        // Send message to inform extension that webview is ready to receive data.
        if (!vscode.current) {
            // @ts-ignore: Expected, part of native VSCode API.
            vscode.current = acquireVsCodeApi();
            vscode.current.postMessage({
                command: 'ready',
                message: undefined
            });
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

    return (
        <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
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
