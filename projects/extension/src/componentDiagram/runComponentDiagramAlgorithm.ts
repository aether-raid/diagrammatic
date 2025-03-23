import { MarkerType } from "@xyflow/react";
import { AppNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types";
import { NodeEdgeData } from "@shared/app.types";

import { LLMProvider } from "../helpers/llm";
import { ComponentEdgeInput, ComponentNodeInput } from "./types";

interface APIResponse {
  "components": any[]; // Replace `any` with the actual type of your components
  "component relationships": any[]; // Replace `any` with the actual type of your relationships
}


function transformComponent(input: ComponentNodeInput): AppNode {
  return {
    id: input.id.toString(), // Convert id to string
    type: "componentEntity",
    position: { x: 0, y: 0 }, // Default position
    data: {
      name: input.name || "Unnamed Component", // Fallback if name is missing
      description: input.description || "No description provided.",
      files: input.files || [], // Ensure files is an array
    },
  };
}

function transformEdge(input: ComponentEdgeInput): AppEdge {
  return {
    id: input.id,
    source: input.source.toString(),
    target: input.target.toString(),
    // sourceHandle: "comp",
    // targetHandle: "comp",
    markerEnd: { type: MarkerType.ArrowClosed },
    label: input.type,
  };
}

export const getComponentDiagram = async (
  nodeEdgeData: NodeEdgeData,
  llmProvider: LLMProvider
): Promise<NodeEdgeData> => {
  const { nodes, edges } = nodeEdgeData;
  const componentNodesEdges: NodeEdgeData = {
    nodes: [],
    edges: [],
  };
  const prompt = `Group the file nodes into functional components for C4 Level 3 Component diagram. 
    Give unique numerical IDs to each component nodes.
    For example:
    {
    "components": [
        { "id": 1, "name": "Auth", "description": "Handles user authentication", "files": ["auth.js", "login.js"] },
        { "id": 2, "name": "API", "description": "Manages API requests", "files": ["api.js"] }
    ],
    "component relationships": [
        { "id": "1-2", "source": 1, "target": 2, "sourceName": "Auth", "targetName": "API", "type": "calls" }
    ]
    }

    Give purely a JSON response in the format:
    "components":[
        { "id": component_id,
        "name": component_name,
        "description": component_description,	
        "files": [filepaths of files in this component]	
        },...
    ]
    "component relationships":[
        {"id": sourceId-targetId, "source": sourceId, "target": targetId ,"sourceName": component_name1, "targetName": component_name2, "type": type

        },....
    ]

    nodes: ${JSON.stringify(nodes)}
    edges: ${JSON.stringify(edges)}`;

  // console.log("Prompt:", prompt);
  try {
    const systemPrompt = "You are an AI that provides structured JSON responses. In the JSON response, only create relationships between components where the source and target components are NOT the same."
    const userPrompt = prompt
    const response: APIResponse = await llmProvider.generateResponse(systemPrompt, userPrompt);

    // Format the component nodes and edges for diagram
    const transformedComponents = response["components"].map(transformComponent);
    const transformedEdges = response["component relationships"].map(transformEdge);
    componentNodesEdges.nodes = transformedComponents;
    componentNodesEdges.edges = transformedEdges;
  } catch (error) {
     // TODO: Throw error out to extension for handling
    console.error("Error fetching component diagram:", error);
  }

  return componentNodesEdges;
};
