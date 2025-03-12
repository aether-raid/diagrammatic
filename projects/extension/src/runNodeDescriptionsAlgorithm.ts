import * as vscode from "vscode";

import { AppNode } from "@shared/node.types";

import { NodeDescriptionData, NodeEdgeData } from "./extension.types";
import { retrieveOpenAiApiKey } from "./helpers/apiKey";
import { OpenAIProvider } from "./llm/openAiProvider";
import { LLMProvider } from "./llm/llmProvider";
import { retrieveLLMProviderConfig } from "./helpers/llm";

interface JsonData {
  node_id: string;
  class_description: string;
}

const getNodeDescriptions = async (
  llmProvider: LLMProvider,
  nodeEdgeData: NodeEdgeData
): Promise<NodeDescriptionData> => {
  const { nodes, edges } = nodeEdgeData;
  const descriptions: NodeDescriptionData = {};

  try {
    vscode.window.showInformationMessage("Loading descriptions...");
    const systemPrompt = "You are an AI that provides structured JSON responses."
    const userPrompt = `Give purely a JSON response in the format [{node_id:, class_description:<describe what the class does>},]. Here are the ast details:\n
              nodes: ${JSON.stringify(nodes)}
              edges: ${JSON.stringify(edges)}`
    const response = await llmProvider.generateResponse(systemPrompt, userPrompt);
    const jsonData = response as JsonData[];
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
  const llmProviderName = retrieveLLMProviderConfig();
  const apiKey = retrieveOpenAiApiKey();
  if (!apiKey) {
    vscode.window.showInformationMessage(
      "Node descriptions are disabled. (No API key provided)"
    );
  }

  let llmProvider: LLMProvider | null = null; // TODO: set Gemini as default
  if (llmProviderName === "openai") {
    llmProvider = new OpenAIProvider(apiKey);
  }
  if (!llmProvider) {
    throw new Error("No LLM provider selected.");
  }


  const descriptions = apiKey
    ? await getNodeDescriptions(llmProvider, nodeEdgeData)
    : undefined;
  return addDescriptionToNodes(nodes, descriptions);
};
