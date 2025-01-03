import { AppEdge } from "./edge.types";
import { AppNode } from "./node.types";

export enum Commands {
  ACCEPT_NODE_EDGE_DATA = 'accept-node-edge-data',
  READY = 'ready'
}

export interface AcceptNodeEdgeDataPayload {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface ReadyPayload {};

export interface WebviewCommandMessage {
  command: Commands;
  message: AcceptNodeEdgeDataPayload | ReadyPayload;
}
