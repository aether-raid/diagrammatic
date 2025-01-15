import { BuiltInNode, Node } from "@xyflow/react";
import { HoveredEntity } from "./app.types";

interface FileEntity {
  name: string;
}

interface HighlightableFileEntity extends FileEntity {
  highlighted?: boolean;
}

export type FileNode = Node<{
  fileName: string;
  entities: HighlightableFileEntity[];
  setHoveredEntity?: React.Dispatch<React.SetStateAction<HoveredEntity | undefined>>
}, 'file'>;
export type TextUpdaterNode = Node<{}, 'textUpdater'>;
export type AppNode = BuiltInNode | TextUpdaterNode | FileNode;
