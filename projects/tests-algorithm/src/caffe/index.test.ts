import mock from "mock-require";
import * as sinon from "sinon";

import expectedNodes from "./expectedNodes.json";
import expectedEdges from "./expectedEdges.json";
import {
  calculatePrecisionRecallF1ForEdges,
  calculatePrecisionRecallF1ForNodes,
  compareEntityCounts,
  countEntityTypes,
  countFilesAndLines,
} from "../helper";
import { RuleEngine } from "@extension/codeToDiagram/algorithm/rules";
import path from "path";

// Repository URL: https://github.com/BVLC/caffe
const mockDirectoryPath = "/Users/sharlenetio/Desktop/fyp/samples/caffe";

describe("caffe", () => {
  let rulesetStub: sinon.SinonStub;

  let ruleset: any;
  let runCodeToDiagramAlgorithm: any;

  beforeEach(() => {
    // For those files that need vscode, we need to import them like this
    mock("vscode", {});
    ruleset = require("@extension/helpers/ruleset");
    runCodeToDiagramAlgorithm =
      require("@extension/codeToDiagram/runCodeToDiagramAlgorithm").runCodeToDiagramAlgorithm;

    // Stub ruleset to always return us the default config
    rulesetStub = sinon.stub(ruleset, "retrieveRuleset");
    rulesetStub.returns(RuleEngine.loadRules("./config/default-rules.json"));
  });

  afterEach(() => {
    sinon.restore();
  });

  it("test node structure", () => {
    const { totalFileCount, totalLineCount, fileCount, lineCount } =
      countFilesAndLines(mockDirectoryPath);
    console.log("Total files:", totalFileCount);
    console.log("Total lines of code:", totalLineCount);
    console.log("File count per extension:", fileCount);
    console.log("Line count per extension:", lineCount);

    expectedNodes.forEach((node) => {
      node.data.filePath = path.join(mockDirectoryPath, node.data.filePath);
    });

    const start = process.hrtime();
    const result = runCodeToDiagramAlgorithm(mockDirectoryPath);

    const [seconds, nanoseconds] = process.hrtime(start);
    console.log("Milliseconds:", seconds * 1000 + nanoseconds / 1e6);

    const numComponents = result.nodes.length;
    console.log("Number of components:", numComponents);
    console.log(
      "Ratio of number of components to source files:",
      numComponents / totalFileCount
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

    const { nodeTP, nodeFP, nodeFN, functionTP, functionFP, functionFN } =
      calculatePrecisionRecallF1ForNodes(
        result.nodes as {
          data: {
            entityType: string;
            entityName: string;
            filePath: string;
            items: { name: string; type: string }[];
          };
        }[],
        expectedNodes
      );

    expectedEdges.forEach((edge) => {
      edge.source = path.join(mockDirectoryPath, edge.source);
      edge.target = path.join(mockDirectoryPath, edge.target);
    });
    const { edgeTP, edgeFP, edgeFN } = calculatePrecisionRecallF1ForEdges(
      result.edges,
      expectedEdges
    );

    const overallPrecision =
      (nodeTP + functionTP + edgeTP) /
      (nodeTP + functionTP + edgeTP + (nodeFP + functionFP + edgeFP) || 1);
    const overallRecall =
      (nodeTP + functionTP + edgeTP) /
      (nodeTP + functionTP + edgeTP + (nodeFN + functionFN + edgeFN) || 1);
    const overallF1 =
      (2 * overallPrecision * overallRecall) /
      (overallPrecision + overallRecall || 1);

    console.log("==== Overall Metrics ===");
    console.log("Precision:", overallPrecision);
    console.log("Recall:", overallRecall);
    console.log("F1:", overallF1);
  });

  it('test runtime average over 10 runs', () => {
    const runs = 10;
    let totalTime = 0;
  
    for (let i = 0; i < runs; i++) {
      const start = process.hrtime();
      runCodeToDiagramAlgorithm(mockDirectoryPath);
      const [seconds, nanoseconds] = process.hrtime(start);
      const ms = seconds * 1000 + nanoseconds / 1e6;
      totalTime += ms;
      console.log(`Run ${i + 1}: ${ms.toFixed(2)} ms`);
    }
  
    const average = totalTime / runs;
    console.log(`\nAverage execution time over ${runs} runs: ${average.toFixed(2)} ms`);
  });
});
