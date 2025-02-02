import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";

export interface NodeEdgeData {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface NodeDescriptionData {
  [nodeId: string]: string
}
