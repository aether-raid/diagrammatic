import { NodeEdgeData } from "./extension.types";
import {
  findLinks,
  makeFileGroup,
  parseFilesToASTs,
} from "./algorithm/function";
import { Edge, Group } from "./algorithm/model";
import { transformEdges, transformFileGroups } from "./algorithm/transform";

export const runCodeToDiagramAlgorithm = (): NodeEdgeData => {
  const astTrees = parseFilesToASTs(
    "/Users/sharlenetio/Desktop/nestjs-realworld-example-app/src/article",
    true
  );

  const fileGroups: Group[] = [];
  astTrees.forEach(([fileName, ast]) => {
    const fileGroup = makeFileGroup(ast.rootNode, fileName);
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
