import { BuiltInNode, Node } from "@xyflow/react";

export type EntityCompNode = Node<
  {
    name: string;
    description?: string;
    files?: string[];
  },
  "comp"
>;

export type TextUpdaterNode = Node<{}, "textUpdater">;

export type CompNode = BuiltInNode | TextUpdaterNode | EntityCompNode

// Define input node type
export interface InputComponentNode {
  id: number;
  name: string;
  description: string;
  files: string[];
}

// Define input edge type
export interface InputComponentEdge {
  id: string;
  source: number;
  target: number;
  sourceName: string;
  targetName: string;
  type: string;
}

