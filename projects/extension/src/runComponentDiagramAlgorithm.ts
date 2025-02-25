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
            files: input.files || [] // Ensure files is an array
        }
    };
}

function transformEdge(input: InputComponentEdge): CompEdge {
    return {
        id: input.id,
        source: input.source.toString(),
        target: input.target.toString(),
        sourceHandle: "comp",
        targetHandle: "comp",
        markerEnd: { type: MarkerType.ArrowClosed }
    };
}


export const getComponentDiagram = async (nodeEdgeData: NodeEdgeData): Promise<CompNodeEdgeData> => {
    const { nodes, edges } = nodeEdgeData;
    const componentNodesEdges: CompNodeEdgeData = {
        compNodes: [],
        compEdges: []
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
    edges: ${JSON.stringify(edges)}`
    console.log("Prompt:", prompt)
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4-turbo", // Choose the appropriate model
                messages: [
                    {
                        role: "system",
                        content: "You are an AI that provides structured JSON responses. In the JSON response, only create relationships between components where the source and target components are NOT the same."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0
            },
            {
                headers: {
                    Authorization: apikey,
                    "Content-Type": "application/json"
                }
            }
        );
        const jsonResponse = response.data.choices[0].message.content;
        const cleanedResponse = JSON.parse(jsonResponse.replace(/```json\n?|\n?```/g, ""));

        // Format the component nodes and edges for diagram
        const transformedComponents = cleanedResponse["components"].map(transformComponent);
        const transformedEdges = cleanedResponse["component relationships"].map(transformEdge)
        componentNodesEdges.compNodes = transformedComponents
        componentNodesEdges.compEdges = transformedEdges
        
    } catch (error) {
        console.error("Error fetching component diagram:", error)
    }
    return componentNodesEdges
}   