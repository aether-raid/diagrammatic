import * as vscode from "vscode";
import { readFile } from 'fs/promises';
import { retrieveApiKey } from "../helpers/apiKey";
import { LLMProvider } from "../helpers/llm";
import { NodeEdgeData } from "@shared/app.types";
import { AppNode } from "@shared/node.types";

interface JsonData {
  node_id: string;
  class_name: string;
  class_description: string;
  functions: [{
    function_name: string, 
    function_description: string
    parameters: [
      {
        inputType: string,
        description: string
      }
    ]
    output: {
      outputType: string,
      description: string
    }
  }];
}

const transformFilePath = (filePath: string): string => {
  let normalizedPath = filePath.replace(/\\/g, "/");
  return normalizedPath.endsWith(".ts")
    ? normalizedPath
    : normalizedPath.replace(/\.[^.]+$/, "");
}

const getFunctionDescriptions = async (
  llmProvider: LLMProvider,
  nodeEdgeData: NodeEdgeData
) => {
  // console.log(nodeEdgeData.nodes);
  console.log("======= Loading function descriptions =======");
  const allResponses = await Promise.all(
    nodeEdgeData.nodes.map(async (node: AppNode) => {
      try {
        const filePath = transformFilePath(node.id);
        const content = await readFile(filePath, "utf-8");
        const systemPrompt = "You are an AI that provides structured JSON responses for code documentation creation."
        const userPrompt = `Give purely a JSON response in the format [node_id: ${node.id},class_name:,class_description,functions:[{function_name:,function_description:,parameters:[{inputType:, description:(describe what needs to be inputted just like in a code documentation)}],output:{outputType, description:(describe what needs to be returned just like in a code documentation)}]]. Here is the file content:\n` + content;
        const response = await llmProvider.generateResponse(systemPrompt, userPrompt);
        const jsonData = response as JsonData;
        return jsonData;
      } catch (error) {
        console.error("Error fetching function descriptions:", error);
      }
    })
  )
  console.log(allResponses);  
};

export const runFunctionDescriptionsAlgorithm = async (
  nodeEdgeData: NodeEdgeData,
  llmProvider: LLMProvider
) => {

  const apiKey = retrieveApiKey();
  if (!apiKey) {
    vscode.window.showInformationMessage(
      "Node descriptions are disabled. (No API key provided)"
    );
  }
  getFunctionDescriptions(llmProvider, nodeEdgeData)
};
