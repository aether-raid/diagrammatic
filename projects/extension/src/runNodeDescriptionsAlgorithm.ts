import { AppNode } from "@shared/node.types";
import { NodeDescriptionData } from "./extension.types";
import axios from 'axios';
import { NodeEdgeData } from "./extension.types";

interface JsonData {
  node_id: string;
  class_description: string;
}

const getNodeDescriptions = async (nodeEdgeData: NodeEdgeData): Promise<NodeDescriptionData> => {
  // Replace this function with the LLM/algorithm code @shawn to get the descriptions for each file
  // You probably need to discuss with Sharlene about how to sync the identifiers between your algorithms
  // i.e. How to identify which nodes are the same between both algorithms
  // Feel free to change the data shape below, it's just an example.
  const { nodes, edges } = nodeEdgeData;
  const descriptions: NodeDescriptionData = {};

    try {
      // const filePath = node.id.slice(0, node.id.lastIndexOf("."));
      // const sourceCode = fs.readFileSync(filePath, "utf-8");
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
              content:
                `Give purely a JSON response in the format [{node_id:, class_description:<describe what the class does>},]. Here are the ast details:\n
                nodes: ${JSON.stringify(nodes)}
                edges: ${JSON.stringify(edges)}`
                // "Give purely a JSON response in the format {classes:[{class_name:'', class_description:'', functions:[{function_name:'', description:''}]}]}. Here is the source code:\n" +
                // sourceCode
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
      const jsonData = JSON.parse(cleanedResponse) as JsonData[];
      nodes.forEach(node => {
        const match = jsonData.find(data => data.node_id === node.id);
        if (match) {
            descriptions[node.id] = match.class_description;
        }
      });
  
    } catch (error) {
      console.error("Error fetching descriptions:", error);
    }

  return descriptions;
};

const addDescriptionToNodes = (nodes: AppNode[], descriptions: NodeDescriptionData): AppNode[] => {
  nodes.map(node => {
    if (!(node.id in descriptions)) {
      return node;
    }

    node.data = {
      ...node.data,
      description: descriptions[node.id]
    };
    return node;
  })

  return nodes;
};

export const runNodeDescriptionsAlgorithm = async (nodes: AppNode[], nodeEdgeData: NodeEdgeData): Promise<AppNode[]> => {
  const descriptions = getNodeDescriptions(nodeEdgeData);
  return addDescriptionToNodes(nodes, await descriptions);
}
