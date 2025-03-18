import * as vscode from "vscode";
import { readFile } from 'fs/promises';
import { AppNode } from "@shared/node.types";

import { NodeEdgeData } from "../extension.types";
import { retrieveApiKey } from "../helpers/apiKey";
import { LLMProvider } from "../helpers/llm";
import { json } from "stream/consumers";

interface JsonData {
  node_id: string;
  class_name: string;
  class_description: string;
  functions: [{function_name: string, description: string}];
}

const transformFilePath = (filePath: string): string => {
  let normalizedPath = filePath.replace(/\\/g, "/");
  return normalizedPath.replace(/\.[^.]+$/, "");
}

const getFunctionDescriptions = async (
  llmProvider: LLMProvider,
  nodeEdgeData: NodeEdgeData
) => {
  console.log("======= Loading function descriptions =======");
  const allResponses = await Promise.all(
    nodeEdgeData.nodes.map(async (node) => {
      try {
        const filePath = transformFilePath(node.id);
        const content = await readFile(filePath, "utf-8");
        const systemPrompt = "You are an AI that provides structured JSON responses."
        const userPrompt = `Give purely a JSON response in the format [node_id: ${node.id},class_name:,class_description,functions:[{function_name:,input:inputName:dataType,output:outputName:dataType,description:}]]. Here is the file content:\n` + content;
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

// const addDescriptionToNodes = (
//   nodes: AppNode[],
//   descriptions?: NodeDescriptionData
// ): AppNode[] => {
//   // Make a copy to not affect the original
//   const tmp = [...nodes];

//   tmp.map((node) => {
//     if (!descriptions) {
//       node.data = {
//         ...node.data,
//         description: "Descriptions are disabled. (No API key provided.)",
//       };
//       return node;
//     }

//     if (!(node.id in descriptions)) {
//       return node;
//     }

//     node.data = {
//       ...node.data,
//       description: descriptions[node.id],
//     };
//     return node;
//   });

//   return tmp;
// };

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
  // const descriptions = apiKey
  //   ? await getNodeDescriptions(llmProvider, nodeEdgeData)
  //   : undefined;
  // return addDescriptionToNodes(nodes, descriptions);
};
