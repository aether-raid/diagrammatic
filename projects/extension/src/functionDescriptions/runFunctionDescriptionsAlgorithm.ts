import { readFile } from 'fs/promises';

import { NodeEdgeData } from "@shared/app.types";
import { AppNode, FunctionDescription } from "@shared/node.types";

import { LLMProvider } from "../helpers/llm";

interface FnDescResponse {
  node_id: string;
  class_name: string;
  class_description: string;
  functions: FunctionDescription[];
}

const getFilePath = (node: AppNode): string | undefined => {
  if ("filePath" in node.data) {
    return node.data.filePath;
  }
  return undefined;
}

const extractImportPaths = (content: string): string[] => {
  const importRegex = /import\s+(?:[^'"\s]+\s+)?['"]([^'"]+)['"]/g;
  let match;
  const importPaths: string[] = [];

  while ((match = importRegex.exec(content)) !== null) {
    let path = match[1].replace(/^(\.\/|\.\.\/|@)+/, "");
    importPaths.push(path);
  }
  return importPaths;
};

const matchImportsToNodes = (importPaths: string[], nodeEdgeData: NodeEdgeData): string[] => {
  return nodeEdgeData.nodes
    .filter(node => {
      const transformedPath = getFilePath(node);
      return transformedPath && importPaths.some(importPath => transformedPath.includes(importPath));
    })
    .map(node => getFilePath(node) as string);
};

const readAndConcatenateFiles = async (filePaths: string[]): Promise<string> => {
  // console.log("matches:\n" + matchedNodeIds)
  let combinedContent = "";
  for (const filePath of filePaths) {
    try {
      const fileContent = await readFile(filePath, "utf-8");
      combinedContent += `\n// Content from: ${filePath}\n` + fileContent;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }
  //console.log("combi content:", combinedContent);
  return combinedContent;
};

export const getFunctionDescriptions = async (
  llmProvider: LLMProvider,
  nodeEdgeData: NodeEdgeData,
  targetNodeId: string
) => {
  //console.log("======= Loading function descriptions =======");
  const targetNode = nodeEdgeData.nodes.find((node: AppNode) => node.id === targetNodeId);
  if (!targetNode) {
    console.error(`Node with ID ${targetNodeId} not found.`);
    return;
  }

  try {
    const filePath = getFilePath(targetNode);
    if (!filePath) {
      console.error("File path is undefined.");
      return;
    }
    const content = await readFile(filePath, "utf-8");

    const combinedContent = readAndConcatenateFiles(matchImportsToNodes(extractImportPaths(content), nodeEdgeData));

    const systemPrompt = "You are an AI that provides structured JSON responses for code documentation creation."
    const userPrompt = `Give purely a JSON response in the format [node_id: ${targetNode.id},class_name:,class_description,functions:[{function_name:,function_description:,parameters:[{inputName:, inputType:, description:(describe what needs to be inputted just like in a code documentation)}],output:{outputName, outputType:, description:(describe what needs to be returned just like in a code documentation)}]] only for this file. Here is the file content:\n` + content + '\nHere is the context:\n' + combinedContent;

    const response = await llmProvider.generateResponse(systemPrompt, userPrompt) as FnDescResponse[];
    console.log(response);
    return response[0].functions;
  } catch (error) {
    console.error("Error fetching function descriptions:", error);
    return;
  }
};
