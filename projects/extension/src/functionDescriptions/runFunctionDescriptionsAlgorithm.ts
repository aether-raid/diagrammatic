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
    output: 
      {
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

const extractImportPaths = (content: string): string[] => {
  const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
  let match;
  const importPaths: string[] = [];

  while ((match = importRegex.exec(content)) !== null) {
    importPaths.push(match[1].replace(/^(\.\/|\.\.\/|@)+/, "")); // Extracted file path from the 'from' clause
  }
  console.log("import paths:\n" + importPaths);
  return importPaths;
};

const matchImportsToNodes = (importPaths: string[], nodeEdgeData: NodeEdgeData): string[] => {
  return nodeEdgeData.nodes
    .filter(node => importPaths.some(importPath => transformFilePath(node.id).includes(importPath)))
    .map(node => node.id);
};

const readAndConcatenateFiles = async (matchedNodeIds: string[]): Promise<string> => {
  let combinedContent = "";
  console.log("matches:\n" + matchedNodeIds);
  for (const nodeId of matchedNodeIds) {
    try {
      const fileContent = await readFile(transformFilePath(nodeId), "utf-8");
      combinedContent += `\n// Content from: ${nodeId}\n` + fileContent;
    } catch (error) {
      console.error(`Error reading file ${nodeId}:`, error);
    }
  }

  return combinedContent;
};

const getFunctionDescriptions = async (
  llmProvider: LLMProvider,
  nodeEdgeData: NodeEdgeData,
  targetNodeId: string
) => {
  // console.log(nodeEdgeData.nodes);
  console.log("======= Loading function descriptions =======");
  const targetNode = nodeEdgeData.nodes.find((node: AppNode) => node.id === targetNodeId);
  if (!targetNode) {
    console.error(`Node with ID ${targetNodeId} not found.`);
    return null;
  }
  try {
    const filePath = transformFilePath(targetNode.id);
    const content = await readFile(filePath, "utf-8");
    // const combinedContent = "";
    const combinedContent = readAndConcatenateFiles(matchImportsToNodes(extractImportPaths(content), nodeEdgeData));
    const systemPrompt = "You are an AI that provides structured JSON responses for code documentation creation."
    const userPrompt = `Give purely a JSON response in the format [node_id: ${targetNode.id},class_name:,class_description,functions:[{function_name:,function_description:,parameters:[{inputType:, description:(describe what needs to be inputted just like in a code documentation)}],output:{outputType, description:(describe what needs to be returned just like in a code documentation)}]]. Here is the file content:\n` + content + '\nHere is the context:\n' + combinedContent;
    const response = await llmProvider.generateResponse(systemPrompt, userPrompt);
    const jsonData = response as JsonData;
    console.log(jsonData);
  } catch (error) {
    console.error("Error fetching function descriptions:", error);
  }  
};

export const runFunctionDescriptionsAlgorithm = async (
  nodeEdgeData: NodeEdgeData,
  llmProvider: LLMProvider,
  targetNodeId: string
) => {

  const apiKey = retrieveApiKey();
  if (!apiKey) {
    vscode.window.showInformationMessage(
      "Node descriptions are disabled. (No API key provided)"
    );
  }
  getFunctionDescriptions(llmProvider, nodeEdgeData, targetNodeId)
};
