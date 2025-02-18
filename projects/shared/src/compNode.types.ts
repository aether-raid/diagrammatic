import { BuiltInNode, Node } from "@xyflow/react";

export type EntityCompNode = Node<
  {
    name: string;
    description?: string;
    files?: string[];
  },
  "comp"
>;

export type CompNode = BuiltInNode | EntityCompNode
