import { runCodeToDiagramAlgorithm } from "../runCodeToDiagramAlgorithm.js";
import { expect } from "chai";

// https://github.com/lujakob/nestjs-realworld-example-app
const mockDirectoryPath =
  "/Users/sharlenetio/Desktop/fyp/samples/nestjs-realworld-example-app/src/article";

const expectedNodes = [
  {
    data: {
      entityName: "ArticleService",
      entityType: "class",
      items: [
        {
          name: "findAll",
          lineNumber: 26,
        },
        {
          name: "findFeed",
          lineNumber: 69,
        },
        {
          name: "findOne",
          lineNumber: 99,
        },
        {
          name: "addComment",
          lineNumber: 104,
        },
        {
          name: "deleteComment",
          lineNumber: 117,
        },
        {
          name: "favorite",
          lineNumber: 135,
        },
        {
          name: "unFavorite",
          lineNumber: 152,
        },
        {
          name: "findComments",
          lineNumber: 171,
        },
        {
          name: "create",
          lineNumber: 176,
        },
        {
          name: "update",
          lineNumber: 200,
        },
        {
          name: "delete",
          lineNumber: 207,
        },
        {
          name: "slugify",
          lineNumber: 211,
        },
      ],
    },
  },
];

suite("nestjs-realworld-example-app", () => {
  test("should contain the relevant classes and functions for the codebase", () => {
    const result = runCodeToDiagramAlgorithm(mockDirectoryPath);

    expectedNodes.forEach((expectedNode) => {
      expect(result.nodes).to.deep.include(expectedNode);
    });
  });
});
