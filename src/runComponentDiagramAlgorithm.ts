import { AppNode } from "@shared/node.types";
import { AppEdge } from "@shared/edge.types"
import { NodeEdgeData } from "./extension.types";
import axios from 'axios';

export const getComponentDiagram = async (nodeEdgeData: NodeEdgeData): Promise<NodeEdgeData> => {
    const { nodes, edges } = nodeEdgeData;
    try {
        const response = await axios.post<{ response: string }>(
            "http://localhost:5000/chat",
            {
                message: 
                    `Given the nodes and edges, group the nodes into functional components for C4 Level 3 component diagram. Return in purely json format detailing the name, description, nodes and edges to represent the relationships between the component nodes.
                    nodes: ${JSON.stringify(nodes)}
                    edges: ${JSON.stringify(edges)}`
            }
        );
        const result = response.data?.response;
        if (result) {
            console.log("Component Diagram Result:", result);

            // Return the parsed response or update NodeEdgeData as needed
            // return JSON.parse(result) as NodeEdgeData;
            return nodeEdgeData;
        } else {
            throw new Error("Invalid response from the server.");
        }
    } catch (error) {
        console.error("Error fetching component diagram:", error)
        return nodeEdgeData;
    }
}
