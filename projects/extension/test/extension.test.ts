import * as assert from "assert";
import * as vscode from "vscode";
import proxyquire from "proxyquire";
import { NodeEdgeData } from "@shared/app.types";
import { EntityNode } from "@shared/node.types";

describe("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  it("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

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
});
