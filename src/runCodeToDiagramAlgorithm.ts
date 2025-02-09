import * as vscode from "vscode";

import { existsSync } from "fs";
import path from "path";

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

const getDefaultRulesetPath = () => {
  const extension = vscode.extensions.getExtension('diagrammatic.diagrammatic')!;
  const path = `${extension.extensionPath}\\config\\default-rules.json`

  if (!path || !existsSync(path)) return;
  return path;
}

const retrieveRuleset = () => {
  const config = vscode.workspace.getConfiguration();

  let rulesetPath = config.get<string>('diagrammatic.codeToDiagramRulesetFile');

  if (!rulesetPath || !existsSync(rulesetPath)) {
    vscode.window.showInformationMessage(`No ruleset file was found at '${rulesetPath}'. Using default rules.`);
    rulesetPath = getDefaultRulesetPath();
    if (!rulesetPath) return; // Oh no, someone messed with default-rules.json :(
  }

  return RuleEngine.loadRules(rulesetPath);
}

export const runCodeToDiagramAlgorithm = (
  directoryPath: string
): NodeEdgeData => {
  const rules = retrieveRuleset();
  if (!rules) {
    throw new Error("Ruleset file not found. Please set 'diagrammatic.codeToDiagramRulesetFile' in settings! Btw this should not show up.. if you see this means you've messed with the default rules by accident!");
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
