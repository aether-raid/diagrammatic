import { NodeEdgeData } from "./extension.types";
import axios from 'axios';

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
                    Authorization: `Bearer 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`,
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
