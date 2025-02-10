import { AppNode } from "@shared/node.types";
import { NodeDescriptionData } from "./extension.types";
import axios from 'axios';
import fs from 'fs';

const getNodeDescriptions = async (nodes: AppNode[]): Promise<NodeDescriptionData> => {
  // Replace this function with the LLM/algorithm code @shawn to get the descriptions for each file
  // You probably need to discuss with Sharlene about how to sync the identifiers between your algorithms
  // i.e. How to identify which nodes are the same between both algorithms
  // Feel free to change the data shape below, it's just an example.
  var description = "testing";
  const descriptions: NodeDescriptionData = {};

  for (const node of nodes) {
    try {
      const filePath = node.id.slice(0, node.id.lastIndexOf("."));
      const sourceCode = fs.readFileSync(filePath, "utf-8");
      const response = await axios.post<{ response: string }>(
        "http://localhost:5000/chat",
        {
          message:
            "give purely a json response in the format {classes:[class_name:,class_description,functions:[function_name:,description:]]}" +
            sourceCode,
        }
      );
      const regex = /"class_description"\s*:\s*"([^"]+)"/;
      const match = response.data.response.match(regex);
      if (match && match[1]) {
        description = match[1];
      } else {
        console.error("No class_description found.");
      }
  
      descriptions[node.id] = description;
  
    } catch (error) {
      console.error("Error fetching descriptions:", error);
    }
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

export const runNodeDescriptionsAlgorithm = async (nodes: AppNode[]): Promise<AppNode[]> => {
  const descriptions = getNodeDescriptions(nodes);
  return addDescriptionToNodes(nodes, await descriptions);
}
