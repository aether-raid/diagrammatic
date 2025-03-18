import { AppEdge } from "./edge.types";
import { AppNode } from "./node.types";

export interface NodeRow {
  nodeId: string;
  rowId: string;
}

export interface NodeEdgeData {
  nodes: AppNode[];
  edges: AppEdge[];
}
