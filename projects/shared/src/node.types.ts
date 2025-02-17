import { BuiltInNode, Node } from "@xyflow/react";
import { NodeRow } from "./app.types";
import {Diagnostic} from "vscode";

interface EntityItem {
  name: string;
  lineNumber?: number;
}

interface HighlightableEntityItem extends EntityItem {
  highlighted?: boolean;
}

export type EntityNode = Node<
  {
    entityName: string;
    entityType: "class" | "file" | "interface" | "namespace" | "struct" | 'record';
    items: HighlightableEntityItem[];

    setHoveredEntity?: React.Dispatch<
      React.SetStateAction<NodeRow | undefined>
    >;
    description?: string;
    filePath?: string;
    security: {
      clean?: Diagnostic[]
      vulnerability?: Diagnostic[]
      extras?: Diagnostic[]
    } | undefined 
  },
  "entity"
>;

export type TextUpdaterNode = Node<{}, "textUpdater">;

export type AppNode = BuiltInNode | TextUpdaterNode | EntityNode;
