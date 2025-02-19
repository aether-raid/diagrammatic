import { NodeEdgeData } from "./extension.types";
import axios from 'axios';
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });
const apikey = process.env.SECRET_KEY;

export const getComponentDiagram = async (nodeEdgeData: NodeEdgeData): Promise<void> => {
    const { nodes, edges } = nodeEdgeData;
    const prompt = `Group the nodes into functional components for C4 Level 3 component diagram. Return in json format:
                    "components":[
                      { "id": component_id,
                      "name": component_name,
                      "description": component_description,	
                      "files": [files in this component]	
                      },...
                    ]
                    "relationships":[
                      {"id": sourceId-targetId, "source": sourceId, "target": targetId ,"sourceName": component_name1, "targetName": component_name2, "type": type
                      
                      },....
                    ]
                    
                    Use the corresponding component ids for the sourceId and targetId of the relationships
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
                        content: "You are an AI that provides structured JSON responses."
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
                    // Authorization: apikey,
                    "Content-Type": "application/json"
                }
            }
        );
        const jsonResponse = response.data.choices[0].message.content;
        const cleanedResponse = jsonResponse.replace(/```json\n?|\n?```/g, "");
        console.log("response:", cleanedResponse)
    } catch (error) {
        console.error("Error fetching component diagram:", error)
    }
}
