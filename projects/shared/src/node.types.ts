import { BuiltInNode, Node } from "@xyflow/react";
import { NodeRow } from "./app.types";
import { SerializedDiagnostic } from "./vscode.types";
import { Point } from "tree-sitter";

interface EntityItem {
  name: string;
  startPosition: Point;
  endPosition: Point;
  type: string;
}

interface HighlightableEntityItem extends EntityItem {
  highlighted?: boolean;
}

export interface EntityLintData {
  clean?: SerializedDiagnostic[];
  vulnerability?: SerializedDiagnostic[];
  extras?: SerializedDiagnostic[];
}

export type EntityNode = Node<
  {
    entityName: string;
    entityType:
      | "class"
      | "file"
      | "interface"
      | "namespace"
      | "struct"
      | "record";
    items: HighlightableEntityItem[];
    startPosition: Point;
    endPosition: Point;

    matchesSearchTerm?: boolean;
    setHoveredEntity?: React.Dispatch<
      React.SetStateAction<NodeRow | undefined>
    >;
    description?: string;
    filePath?: string;
    security?: EntityLintData;
  },
  "entity"
>;

export type TextUpdaterNode = Node<{}, "textUpdater">;

export type AppNode = BuiltInNode | TextUpdaterNode | EntityNode;
