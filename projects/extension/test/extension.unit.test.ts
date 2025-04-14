import * as assert from "assert";
import proxyquire from "proxyquire";
import sinon from "sinon";
import { NodeEdgeData } from "@shared/app.types";
import { EntityNode, AppNode } from "@shared/node.types";

describe("Unit Test Suite", () => {
  it("getFunctionDescriptions returns expected functions", async () => {
    const mockReadFile = async () => `
      import hello from './utils';
      export function greet(name: string): string {
        return "Hi " + name;
      }
    `;

    const { getFunctionDescriptions } = proxyquire
      .noCallThru()
      .load("../src/functionDescriptions/runFunctionDescriptionsAlgorithm", {
        "fs/promises": {
          readFile: mockReadFile,
        },
        vscode: {
          window: {
            showInformationMessage: () => {},
            showErrorMessage: () => {},
          },
        },
      });

    const mockGenerateResponse = async () => [
      {
        node_id: "node1",
        class_name: "ExampleClass",
        class_description: "Example desc",
        functions: [
          {
            function_name: "greet",
            function_description: "Greets someone",
            parameters: [
              {
                inputName: "name",
                inputType: "string",
                description: "User name",
              },
            ],
            output: {
              outputName: "result",
              outputType: "string",
              description: "Greeting message",
            },
          },
        ],
      },
    ];

    const mockLLMProvider = { generateResponse: mockGenerateResponse };

    const mockNode: EntityNode = {
      id: "node1",
      type: "entity",
      data: {
        entityName: "SomeClass",
        entityType: "class",
        items: [],
        startPosition: { row: 1, column: 0 },
        endPosition: { row: 10, column: 1 },
        filePath: "/fake/path.ts",
      },
      position: { x: 0, y: 0 },
    };

    const mockNodeEdgeData: NodeEdgeData = {
      nodes: [mockNode],
      edges: [],
    };

    const result = await getFunctionDescriptions(
      mockLLMProvider as any,
      mockNodeEdgeData,
      "node1"
    );

    assert.ok(result);
    assert.strictEqual(result?.[0].function_name, "greet");
  });

  it("runNodeDescriptionsAlgorithm adds descriptions correctly", async () => {
    const vscodeStub = {
      window: {
        showInformationMessage: () => {},
        showErrorMessage: () => {},
      },
    };

    const { runNodeDescriptionsAlgorithm } = proxyquire
      .noCallThru()
      .load("../src/nodeDescriptions/runNodeDescriptionsAlgorithm", {
        vscode: vscodeStub,
        "../helpers/apiKey": {
          retrieveApiKey: () => "fake-api-key",
        },
        "../helpers/llm": {
          LLMProvider: class {
            async generateResponse() {
              return [
                {
                  node_id: "node1",
                  class_description: "This is a test node",
                },
              ];
            }
          },
        },
        "../helpers/common": {
          retrieveExtensionConfig: () => ({}), // if needed
          vscode: vscodeStub,
        },
      });

    const mockNode = {
      id: "node1",
      type: "entity",
      data: {
        entityName: "TestNode",
        entityType: "class",
        items: [],
        startPosition: { row: 0, column: 0 },
        endPosition: { row: 1, column: 0 },
      },
      position: { x: 0, y: 0 },
    };

    const mockEdgeData = {
      nodes: [mockNode],
      edges: [],
    };

    const result = await runNodeDescriptionsAlgorithm(
      [mockNode],
      mockEdgeData,
      new (class {
        async generateResponse() {
          return [
            {
              node_id: "node1",
              class_description: "This is a test node",
            },
          ];
        }
      })()
    );

    assert.strictEqual(result[0].data.description, "This is a test node");
  });
});
