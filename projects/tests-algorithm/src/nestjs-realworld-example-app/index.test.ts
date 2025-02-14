import mock from "mock-require";
import * as sinon from "sinon";

import expectedNodes from "./expectedNodes.json";
import {
  calculateFunctionMetrics,
  calculatePrecisionRecallF1,
  compareEntityCounts,
  countEntityTypes,
  countFilesAndLines,
} from "../helper";
import { RuleEngine } from "@extension/algorithm/rules";

// Repository URL: https://github.com/lujakob/nestjs-realworld-example-app
const mockDirectoryPath =
  "/Users/sharlenetio/Desktop/fyp/samples/nestjs-realworld-example-app/src";

describe("nestjs-realworld-example-app", () => {
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
      "Ratio of number of components to source files:",
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

    calculatePrecisionRecallF1(
      result.nodes as {
        data: {
          entityType: string;
          entityName: string;
          items: { name: string; lineNumber: number }[];
        };
      }[],
      expectedNodes
    );
  });
});
