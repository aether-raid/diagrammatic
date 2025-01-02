import { AppEdge } from "./edges/types";
import { AppNode } from "./nodes/types";

interface AcceptNodeEdgeDataMessage {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface WebviewMessage {
  command: string;
  message: AcceptNodeEdgeDataMessage;
}
