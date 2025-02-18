import { makeFileGroup, findLinks, parseFilesToASTs } from "./function.js";
import { RuleEngine } from "./rules.js";
import path from "path";
import { transformEdges, transformFileGroups } from "./transform.js";
import { visualizeAST } from "./temp.js";

const rules = RuleEngine.loadRules("rules.json");

const astTrees = await parseFilesToASTs(
  // "/Users/sharlenetio/Desktop/fyp/samples/netflix-clone-react-typescript/src",
  // "/Users/sharlenetio/Desktop/fyp/samples/FinanceTracker/FinTech",
  // "/Users/sharlenetio/Desktop/fyp/samples/node-express-realworld-example-app/src/app/routes/article",
  // "/Users/sharlenetio/Desktop/fyp/samples/node-express-realworld-example-app/src/app/routes/test",
  "/Users/sharlenetio/Desktop/fyp/samples/test",
  true
);

const fileGroups = [];
astTrees.forEach(([filePath, fileName, ast], index) => {
  visualizeAST(ast.rootNode);
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
  console.log(nodeA.toString())
}

let allEdges = [];
for (const nodeA of allNodes) {
  const links = findLinks(nodeA, allNodes);
  allEdges = allEdges.concat(links);
}

const outputNodes = transformFileGroups(fileGroups);
for (const o of outputNodes) {
  console.log(o);
  console.log(o.data.entities)
}

const outputEdges = transformEdges(allEdges);
console.log(outputEdges);
