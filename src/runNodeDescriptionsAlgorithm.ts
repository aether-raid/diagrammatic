import { AppNode } from "@shared/node.types";
import { NodeDescriptionData } from "./extension.types";

const getNodeDescriptions = (): NodeDescriptionData => {
  // Replace this function with the LLM/algorithm code @shawn to get the descriptions for each file
  // You probably need to discuss with Sharlene about how to sync the identifiers between your algorithms
  // i.e. How to identify which nodes are the same between both algorithms
  // Feel free to change the data shape below, it's just an example.

  // Mock descriptions (following the mock node data in webview-ui/nodes/index.ts)
  const descriptions = {
    '5': 'This file serves as a central entity that manages multiple agricultural components. It coordinates the planting & harvesting processes.',
    '5a': 'This class is responsible for crop planting. It encapsulates the various functions required to plant crops.',
    '5b': 'This class is responsible for harvesting crops once they are ready. It encapsulates the various functions required to harvest different crops.',
  };

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

export const runNodeDescriptionsAlgorithm = (nodes: AppNode[]): AppNode[] => {
  const descriptions = getNodeDescriptions();
  return addDescriptionToNodes(nodes, descriptions);
}
