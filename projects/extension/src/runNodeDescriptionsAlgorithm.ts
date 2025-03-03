import axios from "axios";
import * as vscode from "vscode";

import { AppNode } from "@shared/node.types";

import { NodeDescriptionData, NodeEdgeData } from "./extension.types";
import { retrieveOpenAiApiKey } from "./helpers/apiKey";

interface JsonData {
  node_id: string;
  class_description: string;
}

const getNodeDescriptions = async (
  apiKey: string,
  nodeEdgeData: NodeEdgeData
): Promise<NodeDescriptionData> => {
  const { nodes, edges } = nodeEdgeData;
  const descriptions: NodeDescriptionData = {};

  try {
    vscode.window.showInformationMessage("Loading descriptions...");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI that provides structured JSON responses.",
          },
          {
            role: "user",
            content: `Give purely a JSON response in the format [{node_id:, class_description:<describe what the class does>},]. Here are the ast details:\n
              nodes: ${JSON.stringify(nodes)}
              edges: ${JSON.stringify(edges)}`,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const jsonResponse = response.data.choices[0].message.content;
    const cleanedResponse = jsonResponse.replace(/```json\n?|\n?```/g, "");
    const jsonData = JSON.parse(cleanedResponse) as JsonData[];
    nodes.forEach((node) => {
      const match = jsonData.find((data) => data.node_id === node.id);
      if (match) {
        descriptions[node.id] = match.class_description;
      }
    });

    vscode.window.showInformationMessage("Descriptions loaded!");
  } catch (error) {
    vscode.window.showErrorMessage("Error fetching descriptions");
    console.error("Error fetching descriptions:", error);
  }

  return descriptions;
};

const addDescriptionToNodes = (
  nodes: AppNode[],
  descriptions?: NodeDescriptionData
): AppNode[] => {
  nodes.map((node) => {
    if (!descriptions) {
      node.data = {
        ...node.data,
        description: "Descriptions are disabled. (No API key provided.)",
      };
      return node;
    }

    if (!(node.id in descriptions)) {
      return node;
    }

    node.data = {
      ...node.data,
      description: descriptions[node.id],
    };
    return node;
  });

  return nodes;
};

export const runNodeDescriptionsAlgorithm = async (
  nodes: AppNode[],
  nodeEdgeData: NodeEdgeData
): Promise<AppNode[]> => {
  const apiKey = retrieveOpenAiApiKey();
  if (!apiKey) {
    vscode.window.showInformationMessage(
      "Node descriptions are disabled. (No API key provided)"
    );
  }

  const descriptions = apiKey
    ? await getNodeDescriptions(apiKey, nodeEdgeData)
    : undefined;
  return addDescriptionToNodes(nodes, descriptions);
};
