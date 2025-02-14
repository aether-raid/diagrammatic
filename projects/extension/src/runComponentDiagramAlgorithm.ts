import { NodeEdgeData } from "./extension.types";
import axios from 'axios';

export const getComponentDiagram = async (nodeEdgeData: NodeEdgeData): Promise<string> => {
    const { nodes, edges } = nodeEdgeData;
    const prompt = `Group the nodes into functional components for C4 Level 3 component diagram. Return in json format:
                    "components":[
                      {"name": component_name,
                      "description": component_description,	
                      "files": [files in this component]	
                      },...
                    ]
                    "relationships":[
                      {"source": component_name1, "target": component_name2, "type": type
                      
                      },....
                    ]
                      
                    nodes: ${JSON.stringify(nodes)}
                    edges: ${JSON.stringify(edges)}`
    console.log("Prompt:", prompt)
    try {
        const response = await axios.post<{ response: string }>(
            "http://localhost:5000/chat",
            {
                message: prompt
            }
        );
        const result = response.data?.response;
        if (result) {
            console.log("Component Diagram Result:", result);

            // Return the parsed response or update NodeEdgeData as needed
            // return JSON.parse(result) as NodeEdgeData;
            return result;
        } else {
            throw new Error("Invalid response from the server.");
        }
    } catch (error) {
        console.error("Error fetching component diagram:", error)
        return "Error fetching component diagram";
    }
}
