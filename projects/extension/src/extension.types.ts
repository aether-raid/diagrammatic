import { AppEdge } from "@shared/edge.types";
import { AppNode } from "@shared/node.types";
import { CompEdge } from "@shared/compEdge.types";
import { CompNode } from "@shared/compNode.types";

export interface NodeEdgeData {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface NodeDescriptionData {
  [nodeId: string]: string
}

export interface CompNodeEdgeData {
  compNodes: CompNode[];
  compEdges: CompEdge[];
}