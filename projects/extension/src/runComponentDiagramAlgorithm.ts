import { NodeEdgeData } from "./extension.types";
import { MarkerType } from "@xyflow/react";
import axios from "axios";
import * as dotenv from "dotenv";
import * as path from "path";
import { InputComponentNode, InputComponentEdge } from "@shared/compNode.types";
import { CompNode } from "@shared/compNode.types";
import { CompEdge } from "@shared/compEdge.types";
import { CompNodeEdgeData } from "./extension.types";
dotenv.config({ path: path.resolve(__dirname, ".env") });
const apikey = process.env.SECRET_KEY;

function transformComponent(input: InputComponentNode): CompNode {
  return {
    id: input.id.toString(), // Convert id to string
    type: "comp",
    position: { x: 0, y: 0 }, // Default position
    data: {
      name: input.name || "Unnamed Component", // Fallback if name is missing
      description: input.description || "No description provided.",
      files: input.files || [], // Ensure files is an array
    },
  };
}

function transformEdge(input: InputComponentEdge): CompEdge {
  return {
    id: input.id,
    source: input.source.toString(),
    target: input.target.toString(),
    sourceHandle: "comp",
    targetHandle: "comp",
    markerEnd: { type: MarkerType.ArrowClosed },
    label: input.type,
  };
}

export const getComponentDiagram = async (
  nodeEdgeData: NodeEdgeData
): Promise<CompNodeEdgeData> => {
  const { nodes, edges } = nodeEdgeData;
  const componentNodesEdges: CompNodeEdgeData = {
    compNodes: [],
    compEdges: [],
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
  console.log("Prompt:", prompt);
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo", // Choose the appropriate model
        messages: [
          {
            role: "system",
            content:
              "You are an AI that provides structured JSON responses. In the JSON response, only create relationships between components where the source and target components are NOT the same.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          Authorization: apikey,
          "Content-Type": "application/json",
        },
      }
    );
    const jsonResponse = response.data.choices[0].message.content;
    const cleanedResponse = JSON.parse(
      jsonResponse.replace(/```json\n?|\n?```/g, "")
    );

    // Format the component nodes and edges for diagram
    const transformedComponents =
      cleanedResponse["components"].map(transformComponent);
    const transformedEdges =
      cleanedResponse["component relationships"].map(transformEdge);
    componentNodesEdges.compNodes = transformedComponents;
    componentNodesEdges.compEdges = transformedEdges;
  } catch (error) {
    console.error("Error fetching component diagram:", error);
    // For development purposes
    const sample = JSON.parse(
      JSON.stringify({
        compNodes: [
          {
            id: "1",
            type: "comp",
            position: {
              x: 0,
              y: 0,
            },
            data: {
              name: "Article Management",
              description:
                "Handles all article related operations including CRUD operations, comments, and favorites.",
              files: [
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.controller.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.entity.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.interface.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.module.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.service.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\comment.entity.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\dto\\create-article.dto.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\dto\\create-comment.ts",
              ],
            },
          },
          {
            id: "2",
            type: "comp",
            position: {
              x: 0,
              y: 0,
            },
            data: {
              name: "Profile Management",
              description:
                "Manages user profiles, including follow and unfollow functionalities.",
              files: [
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\follows.entity.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\profile.controller.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\profile.interface.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\profile.module.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\profile.service.ts",
              ],
            },
          },
          {
            id: "3",
            type: "comp",
            position: {
              x: 0,
              y: 0,
            },
            data: {
              name: "Tag Management",
              description: "Handles operations related to tags.",
              files: [
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\tag\\tag.controller.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\tag\\tag.entity.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\tag\\tag.module.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\tag\\tag.service.ts",
              ],
            },
          },
          {
            id: "4",
            type: "comp",
            position: {
              x: 0,
              y: 0,
            },
            data: {
              name: "User Management",
              description: "Manages user authentication and user data.",
              files: [
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\auth.middleware.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\dto\\create-user.dto.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\dto\\login-user.dto.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\dto\\update-user.dto.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.controller.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.decorator.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.entity.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.interface.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.module.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.service.ts",
              ],
            },
          },
          {
            id: "5",
            type: "comp",
            position: {
              x: 0,
              y: 0,
            },
            data: {
              name: "Application Setup",
              description:
                "Initial setup and configuration of the application.",
              files: [
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\app.controller.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\app.module.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\main.ts",
              ],
            },
          },
          {
            id: "6",
            type: "comp",
            position: {
              x: 0,
              y: 0,
            },
            data: {
              name: "Shared Utilities",
              description:
                "Shared utilities and base classes for the application.",
              files: [
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\shared\\base.controller.ts",
                "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\shared\\pipes\\validation.pipe.ts",
              ],
            },
          },
        ],
        compEdges: [
          {
            id: "1-2",
            source: "1",
            target: "2",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "uses",
          },
          {
            id: "1-3",
            source: "1",
            target: "3",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "uses",
          },
          {
            id: "1-4",
            source: "1",
            target: "4",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "uses",
          },
          {
            id: "2-4",
            source: "2",
            target: "4",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "uses",
          },
          {
            id: "3-4",
            source: "3",
            target: "4",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "uses",
          },
          {
            id: "5-1",
            source: "5",
            target: "1",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "contains",
          },
          {
            id: "5-2",
            source: "5",
            target: "2",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "contains",
          },
          {
            id: "5-3",
            source: "5",
            target: "3",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "contains",
          },
          {
            id: "5-4",
            source: "5",
            target: "4",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "contains",
          },
          {
            id: "5-6",
            source: "5",
            target: "6",
            sourceHandle: "comp",
            targetHandle: "comp",
            markerEnd: {
              type: "arrowclosed",
            },
            label: "contains",
          },
        ],
      })
    );
    componentNodesEdges.compNodes = sample.compNodes;
    componentNodesEdges.compEdges = sample.compEdges;
  }
  return componentNodesEdges;
};
