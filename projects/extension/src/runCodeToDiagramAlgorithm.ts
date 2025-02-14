import path from "path";
import { Tree } from "tree-sitter";

import { GLOBALS } from "./globals";
import { NodeEdgeData } from "./extension.types";
import {
  findLinks,
  makeFileGroup,
  parseFilesToASTs,
} from "./algorithm/function";
import { Edge, Group } from "./algorithm/model";
import { transformEdges, transformFileGroups } from "./algorithm/transform";
import { retrieveRuleset } from "./helpers/ruleset";


export const runCodeToDiagramAlgorithm = (
  directoryPath: string
): NodeEdgeData => {
  const rules = retrieveRuleset();
  if (!rules) {
    throw new Error(`Ruleset file not found. Please set '${GLOBALS.ruleset.configName}' in settings! Btw this should not show up.. if you see this means you've messed with the default rules by accident!`);
  }

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

  return { nodes: outputNodes, edges: outputEdges };
};
