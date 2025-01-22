import { BuiltInNode, Node } from "@xyflow/react";
import { NodeRow } from "./app.types";

interface EntityItem {
  name: string;
}

interface HighlightableEntityItem extends EntityItem {
  highlighted?: boolean;
}


export type EntityNode = Node<{
  entityName: string;
  entityType: 'class' | 'file';
  items: HighlightableEntityItem[];
  setHoveredEntity?: React.Dispatch<React.SetStateAction<NodeRow | undefined>>
}, 'entity'>;

export type TextUpdaterNode = Node<{}, 'textUpdater'>;

export type AppNode = BuiltInNode | TextUpdaterNode | EntityNode;
