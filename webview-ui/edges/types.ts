import { BuiltInEdge, Edge } from "@xyflow/react";

export type CustomEdge = Edge<{}, 'customEdge'>;
export type AppEdge = BuiltInEdge | CustomEdge;
