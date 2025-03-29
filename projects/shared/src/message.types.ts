import { Feature, FeatureStatus } from "./app.types";
import { AppEdge } from "./edge.types";
import { AppNode, FunctionDescription } from "./node.types";


export enum Commands {
  ACCEPT_COMPONENT_DIAGRAM_DATA = 'accept-component-diagram-data',
  ACCEPT_FN_DESCRIPTIONS = 'accept-fn-descriptions',
  ACCEPT_NODE_EDGE_DATA = 'accept-node-edge-data',
  GENERATE_FN_DESCRIPTIONS = 'generate-fn-descriptions',
  GET_COMPONENT_DIAGRAM = 'get-component-diagram',
  JUMP_TO_LINE = 'jump-to-line',
  READY = 'ready',
  UPDATE_FEATURE_STATUS = 'update-feature-status',
}

export interface AcceptComponentDiagramDataPayload {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface AcceptFnDescriptionPayload {
  nodeId: string;
  data: FunctionDescription[];
}
export interface AcceptNodeEdgeDataPayload {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface JumpToLinePayload {
  filePath: string;
  lineNumber: number;
}

export interface GenerateFnDescriptionPayload {
  nodeId: string;
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
