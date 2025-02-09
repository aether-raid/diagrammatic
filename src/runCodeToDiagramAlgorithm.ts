import { NodeEdgeData } from "./extension.types";
import {
  findLinks,
  makeFileGroup,
  parseFilesToASTs,
} from "./algorithm/function";
import { Edge, Group } from "./algorithm/model";
import { transformEdges, transformFileGroups } from "./algorithm/transform";
import { Tree } from "tree-sitter";
import { RuleEngine } from "./algorithm/rules.js";
import path from "path";

export const runCodeToDiagramAlgorithm = (
  directoryPath: string
): NodeEdgeData => {
  const rules = RuleEngine.loadRules(
    "/Users/sharlenetio/Desktop/fyp/diagrammatic/src/algorithm/rules.json"
  );
  const astTrees = parseFilesToASTs(directoryPath, true);

  const fileGroups: Group[] = [];
  astTrees.forEach(([filePath, fileName, ast]: [string, string, Tree]) => {
    const language = path.extname(fileName);
    const languageRules = rules[language];
    if (!languageRules) {
      throw new Error("File type not configured in rules.json!");
    }
    const fileGroup = makeFileGroup(
      ast.rootNode,
      filePath,
      fileName,
      languageRules
    );
    fileGroups.push(fileGroup);
  });

  console.log(fileGroups);

  const allNodes = fileGroups.flatMap((group) => group.allNodes());
  const allGroups = fileGroups.flatMap((group) => group.allGroups());

  for (const nodeA of allNodes) {
    nodeA.resolveVariables(allGroups, allNodes);
  }

  let allEdges: Edge[] = [];
  for (const nodeA of allNodes) {
    const links = findLinks(nodeA, allNodes);
    allEdges = allEdges.concat(links);
  }

  const outputNodes = transformFileGroups(fileGroups);
  const outputEdges = transformEdges(allEdges);

  console.log(outputNodes);
  console.log(outputEdges);

  return { nodes: outputNodes, edges: outputEdges };
};
