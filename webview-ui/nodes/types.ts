import { BuiltInNode, Node } from "@xyflow/react";

export type FileNode = Node<{}, 'file'>;
export type TextUpdaterNode = Node<{}, 'textUpdater'>;
export type AppNode = BuiltInNode | TextUpdaterNode | FileNode;
