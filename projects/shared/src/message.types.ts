import { Feature, FeatureStatus } from "./app.types";
import { AppEdge } from "./edge.types";
import { AppNode } from "./node.types";


export enum Commands {
  ACCEPT_COMPONENT_DIAGRAM_DATA = 'accept-component-diagram-data',
  ACCEPT_NODE_EDGE_DATA = 'accept-node-edge-data',
  GET_COMPONENT_DIAGRAM = 'get-component-diagram',
  JUMP_TO_LINE = 'jump-to-line',
  READY = 'ready',
  UPDATE_FEATURE_STATUS = 'update-feature-status',
}

export interface AcceptComponentDiagramDataPayload {
  nodes: AppNode[];
  edges: AppEdge[];
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
export interface RegenerateComponentDiagramPayload {};

export interface UpdateFeatureStatusPayload {
  feature: Feature;
  status: FeatureStatus;
}

export interface WebviewCommandMessage {
  command: Commands;
  message: AcceptNodeEdgeDataPayload | JumpToLinePayload | ReadyPayload | AcceptComponentDiagramDataPayload;
}
