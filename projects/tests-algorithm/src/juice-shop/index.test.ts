import mock from "mock-require";
import * as sinon from "sinon";

import expectedNodes from "./expectedNodes.json";
import {
  calculateFunctionMetrics,
  calculateNodeMetrics,
  compareEntityCounts,
  countEntityTypes,
  countFilesAndLines,
} from "../helper";
import { RuleEngine } from "@extension/algorithm/rules";

// Repository URL: https://github.com/juice-shop/juice-shop
const mockDirectoryPath =
  "/Users/sharlenetio/Desktop/fyp/samples/juice-shop";

describe("juice-shop", () => {
  let rulesetStub: sinon.SinonStub;

  let ruleset: any;
  let runCodeToDiagramAlgorithm: any;

  beforeEach(() => {
    // For those files that need vscode, we need to import them like this
    mock("vscode", {});
    ruleset = require("@extension/helpers/ruleset");
    runCodeToDiagramAlgorithm =
      require("@extension/runCodeToDiagramAlgorithm").runCodeToDiagramAlgorithm;

    // Stub ruleset to always return us the default config
    rulesetStub = sinon.stub(ruleset, "retrieveRuleset");
    rulesetStub.returns(RuleEngine.loadRules("./config/default-rules.json"));
  });

  afterEach(() => {
    sinon.restore();
  });

  it("test node structure", () => {
    const { fileCount, lineCount } = countFilesAndLines(mockDirectoryPath);
    console.log("Total files:", fileCount);
    console.log("Total lines of code:", lineCount);

    const start = process.hrtime();
    const result = runCodeToDiagramAlgorithm(mockDirectoryPath);
    const [seconds, nanoseconds] = process.hrtime(start);
    console.log("Milliseconds:", seconds * 1000 + nanoseconds / 1e6);

    const numComponents = result.nodes.length;
    console.log("Number of components:", numComponents);
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

    const { precision, recall, f1 } = calculateNodeMetrics(
      result.nodes as { data: { entityType: string; entityName: string } }[],
      expectedNodes
    );
    console.log("==== Metrics for Nodes ===");
    console.log("Precision:", precision);
    console.log("Recall:", recall);
    console.log("F1:", f1);

    const {
      precision: precision2,
      recall: recall2,
      f1: f12,
    } = calculateFunctionMetrics(
      result.nodes as {
        data: {
          entityType: string;
          entityName: string;
          items: { name: string; lineNumber: number }[];
        };
      }[],
      expectedNodes
    );
    console.log("==== Metrics for Functions ===");
    console.log("Precision:", precision2);
    console.log("Recall:", recall2);
    console.log("F1:", f12);
  });
});
