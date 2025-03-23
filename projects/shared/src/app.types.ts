import { AppEdge } from "./edge.types";
import { AppNode } from "./node.types";

export enum Feature {
  COMPONENT_DIAGRAM = "component-diagram",
  NODE_DESCRIPTIONS = "node-descriptions",
}

export enum FeatureStatus {
  DISABLED = -1,
  ENABLED_LOADING = 0,
  ENABLED_DONE = 1,
}

export interface NodeRow {
  nodeId: string;
  rowId: string;
}

export interface NodeEdgeData {
  nodes: AppNode[];
  edges: AppEdge[];
}
