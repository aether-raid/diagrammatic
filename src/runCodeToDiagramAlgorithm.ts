import { NodeEdgeData } from "./extension.types";
import {
  findLinks,
  makeFileGroup,
  parseFilesToASTs,
} from "./algorithm/function";
import { Edge, Group } from "./algorithm/model";
import { transformEdges, transformFileGroups } from "./algorithm/transform";
import { Tree } from "tree-sitter";

export const runCodeToDiagramAlgorithm = (directoryPath: string): NodeEdgeData => {
  const astTrees = parseFilesToASTs(
    directoryPath,
    true
  );

  const fileGroups: Group[] = [];
  astTrees.forEach(([filePath, fileName, ast]: [string, string, Tree]) => {
    const fileGroup = makeFileGroup(ast.rootNode, filePath, fileName);
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
