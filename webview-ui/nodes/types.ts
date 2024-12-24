import { BuiltInNode, Node } from "@xyflow/react";

export type TextUpdaterNode = Node<{}, 'textUpdater'>
export type AppNode = BuiltInNode | TextUpdaterNode;
