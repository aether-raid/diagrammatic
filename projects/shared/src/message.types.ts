import { AppEdge } from "./edge.types";
import { AppNode } from "./node.types";

export enum Commands {
  ACCEPT_NODE_EDGE_DATA = 'accept-node-edge-data',
  JUMP_TO_LINE = 'jump-to-line',
  READY = 'ready',
  ACCEPT_COMPONENT_DIAGRAM_DATA = 'accept-component-diagram-data',
}

export interface AcceptNodeEdgeDataPayload {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface JumpToLinePayload {
  filePath: string;
  lineNumber: number;
}

export interface ReadyPayload {};

export interface AcceptComponentDiagramDataPayload {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface WebviewCommandMessage {
  command: Commands;
  message: AcceptNodeEdgeDataPayload | JumpToLinePayload | ReadyPayload | AcceptComponentDiagramDataPayload;
}
