import { makeFileGroup, findLinks, parseFilesToASTs } from "./function.js";
import { transformEdges, transformFileGroups } from "./transform.js";

const astTrees = await parseFilesToASTs(
  "/Users/sharlenetio/Desktop/fyp/samples/node-express-realworld-example-app/src/app/routes/article",
  // "/Users/sharlenetio/Desktop/fyp/samples/node-express-realworld-example-app/src/app/routes/test",
  // "/Users/sharlenetio/Desktop/fyp/samples/nestjs-realworld-example-app/src/article",
  true
);

const fileGroups = [];
astTrees.forEach(([filePath, fileName, ast], index) => {
  const fileGroup = makeFileGroup(ast.rootNode, filePath, fileName);
  fileGroups.push(fileGroup);
});

const allNodes = fileGroups.flatMap((group) => group.allNodes());
const allGroups = fileGroups.flatMap((group) => group.allGroups());

for (const nodeA of allNodes) {
  nodeA.resolveVariables(allGroups, allNodes);
}

let allEdges = [];
for (const nodeA of allNodes) {
  const links = findLinks(nodeA, allNodes);
  allEdges = allEdges.concat(links);
}

const outputNodes = transformFileGroups(fileGroups);
for (const o of outputNodes) {
  console.log(o);
}

const outputEdges = transformEdges(allEdges);
console.log(outputEdges);
