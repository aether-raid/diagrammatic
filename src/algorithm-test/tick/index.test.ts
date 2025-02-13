import * as expectedNodes from "./expectedNodes.json";
import { runCodeToDiagramAlgorithm } from "../../runCodeToDiagramAlgorithm";
import {
  calculateMetrics,
  compareEntityCounts,
  countEntityTypes,
  countFilesAndLines,
} from "../helper";

// Repository URL: https://github.com/Tick-CS203/tick
const mockDirectoryPath = "/Users/sharlenetio/Desktop/fyp/samples/tick";

const { fileCount, lineCount } = countFilesAndLines(mockDirectoryPath);
console.log("Total files:", fileCount);
console.log("Total lines of code:", lineCount);

const start = process.hrtime();
const result = runCodeToDiagramAlgorithm(mockDirectoryPath);
const [seconds, nanoseconds] = process.hrtime(start);
console.log("Milliseconds:", seconds * 1000 + nanoseconds / 1e6);

const numComponents = result.nodes.length;
console.log(
  "Ratio of source files to number of components:",
  numComponents / fileCount
);
console.log(
  "Ratio of resulting components to expected components:",
  numComponents / expectedNodes.length
);
const expectedEntityTypes = countEntityTypes(expectedNodes);
const returnedEntityTypes = countEntityTypes(
  result.nodes as { data: { entityType: string } }[]
);
compareEntityCounts(expectedEntityTypes, returnedEntityTypes);

const { precision, recall, f1 } = calculateMetrics(
  result.nodes as { data: { entityType: string; entityName: string } }[],
  expectedNodes
);
console.log("Precision:", precision);
console.log("Recall:", recall);
console.log("F1:", f1);
