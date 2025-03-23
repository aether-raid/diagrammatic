export interface ComponentNodeInput {
  id: number;
  name: string;
  description: string;
  files: string[];
}

// Define input edge type
export interface ComponentEdgeInput {
  id: string;
  source: number;
  target: number;
  sourceName: string;
  targetName: string;
  type: string;
}
