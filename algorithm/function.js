import fs from "fs";
import path from "path";
import Parser from "tree-sitter";
import TypeScript from "tree-sitter-typescript";
import Python from "tree-sitter-python";
import Java from "tree-sitter-java";
import Cpp from "tree-sitter-cpp";

import { Variable, Call, Group, Edge, GroupType } from "./model.js";
import { Language } from "./language.js";

/**
 * Parse files in a folder and convert them to ASTs.
 *
 * @param folderPath - The folder containing the source files.
 * @param skipParseErrors - Whether to skip files that cannot be parsed.
 * @returns A promise resolving to a list of [filepath, filename, AST] tuples.
 */
export function parseFilesToASTs(folderPath, skipParseErrors = true) {
  const parser = new Parser();
  const fileASTTrees = [];

  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      if (fs.statSync(filePath).isDirectory()) {
        const subdirectoryFiles = parseFilesToASTs(filePath, skipParseErrors);
        fileASTTrees.push(...subdirectoryFiles);
      } else if (fs.statSync(filePath).isFile()) {
        if (filePath.endsWith(".ts")) {
          parser.setLanguage(TypeScript.typescript);
        } else if (filePath.endsWith(".tsx")) {
          parser.setLanguage(TypeScript.tsx);
        } else if (filePath.endsWith(".py")) {
          parser.setLanguage(Python);
        } else if (filePath.endsWith(".java")) {
          parser.setLanguage(Java);
        } else if (filePath.endsWith(".cpp")) {
          parser.setLanguage(Cpp);
        } else {
          continue;
        }

        try {
          const sourceCode = fs.readFileSync(filePath, "utf-8");
          const ast = parser.parse(sourceCode);
          fileASTTrees.push([filePath, file, ast]);
        } catch (ex) {
          if (skipParseErrors) {
            console.warn(`Could not parse ${file}. Skipping...`, ex.message);
          } else {
            throw ex;
          }
        }
      }
    }
  } catch (err) {
    console.error("Error reading folder:", err.message);
    throw err;
  }

  return fileASTTrees;
}

/**
 * Walk through the ast tree and return all nodes except decorators and their children
 * TODO: only return certain node types
 */
export function walk(body) {
  let ret = [];
  if (Array.isArray(body)) {
    for (const child of body) {
      ret = ret.concat(walk(child));
    }
  } else {
    if (body.type) {
      ret.push(body);
    }
    for (let i = 0; i < body.childCount; i++) {
      const childNode = body.child(i);
      if (childNode && childNode.type !== "decorator") {
        ret = ret.concat(walk(childNode));
      }
    }
  }
  return ret;
}

/**
 * Get (rightmost) function name from MemberExpression
 *
 * this.userRepository.getUsers() = MemberExpression
 * - objectNode: this.userRepository = MemberExpression
 *    - objectNode: this = ThisNode
 *    - propertyNode: userRepository = PropertyIdentifier
 * - propertyNode: getUsers() = PropertyIdentifier
 *
 * TODO: label calls that have 'this'
 *
 * @returns {string}
 */
export function processMemberExpression(node) {
  const objectNode = node.childForFieldName("object");
  const propertyNode = node.childForFieldName("property");

  if (!objectNode || !propertyNode) {
    return null;
  }

  switch (objectNode.type) {
    case "identifier":
      return objectNode.text + "." + propertyNode.text;
    case "this":
      return propertyNode.text;
    case "member_expression":
      return processMemberExpression(objectNode);
  }

  return null;
}

/**
 * Types of Call Expressions
 * (1) const total = sum(a+b) = Identifier
 * (2) const users = this.userRepository.getUsers() = MemberExpression
 *
 * @returns {Call}
 */
export function processCallExpression(node) {
  const func = node.childForFieldName("function");

  if (!func) {
    return null;
  }

  switch (func.type) {
    case "identifier":
      return new Call({ token: func.text, lineNumber: getLineNumber(node) });
    case "member_expression":
      const funcName = processMemberExpression(func);
      const property = func.childForFieldName("property");
      if (!property) {
        return null;
      }
      const propertyName = property.text;
      if (funcName && propertyName) {
        return new Call({
          token: propertyName,
          ownerToken: funcName,
          lineNumber: getLineNumber(node),
        });
      }
    // for C++
    case "field_expression":
      const identifier = getFirstChildOfType(func, "identifier");
      if (identifier) {
        return new Call({
          token: getFirstChildOfType(func, "field_identifier")?.text,
          ownerToken: identifier.text,
        });
      }
  }

  return null;
}

/**
 * Given a list of lines, find all calls in this list.
 * A CallExpressionNode has attributes "function" and "arguments"
 * this.userRepository.getUserById(userId)
 * - function: this.userRepository.getUserById
 * - arguments: userId
 *
 * @param {Array} body - List of TreeSitter nodes
 * @returns {Array<Call>} - List of Call objects.
 */
export function makeCalls(body) {
  const calls = [];

  for (const node of walk(body)) {
    if (node.type === "call_expression") {
      const call = processCallExpression(node);
      if (call) {
        calls.push(call);
      }
    }
  }
  return calls;
}

/**
 * Types of Variable Declarations
 * (1) const assert = require('assert'); = CallExpression
 * (2) const user = await this.userRepository.getUserById(userId); = AwaitExpression
 * (3) const userRepository = new UserRepository(); = NewExpression
 * (4) const user = this.test; = MemberExpression
 *
 * @returns {[Variable]}
 */
export function processVariableDeclaration(node) {
  const name = node.childForFieldName("name");
  const value = node.childForFieldName("value");

  if (!name || !value) {
    return null;
  }

  switch (value.type) {
    case "new_expression":
      const identifierNode = getFirstChildOfType(value, "identifier");
      if (!identifierNode) {
        return null;
      }
      return new Variable(name.text, identifierNode.text, getLineNumber(node));
    case "call_expression":
      const call = processCallExpression(value);
      return new Variable(name.text, call, getLineNumber(node));
    case "await_expression":
      const callExpressionNode = getFirstChildOfType(value, "call_expression");
      if (!callExpressionNode) {
        return null;
      }
      const awaitCall = processCallExpression(callExpressionNode);
      return new Variable(name.text, awaitCall, getLineNumber(node));
    case "member_expression":
      return new Variable(
        name.text,
        processMemberExpression(value),
        getLineNumber(node)
      );
  }

  return null;
}

export function makeLocalVariables(tree, parent, languageRules) {
  let variables = [];

  for (const node of walk(tree)) {
    switch (node.type) {
      case "variable_declarator":
        const result = processVariableDeclaration(node);
        if (result) {
          variables.push(result);
        }
      // A a;
      // a.callB();
      case "declaration":
        const typeIdentifier = getFirstChildOfType(node, "type_identifier");
        const identifier = getFirstChildOfType(node, "identifier");
        if (typeIdentifier && identifier) {
          variables.push(
            new Variable(
              identifier.text,
              typeIdentifier.text,
              getLineNumber(node)
            )
          );
        }
      // import { SyntaxNode } from 'tree-sitter'
      case "import_statement":
        const importClause = getFirstChildOfType(node, "import_clause");
        const namedImports = getFirstChildOfType(importClause, "named_imports");
        const importSpecifiers = getAllChildrenOfType(
          namedImports,
          "import_specifier"
        );
        const string = getFirstChildOfType(node, "string");
        const stringFragment = getFirstChildOfType(string, "string_fragment");
        const fileGroup = parent.getFileGroup();
        if (stringFragment && fileGroup) {
          for (const importSpecifier of importSpecifiers) {
            const name = getName(importSpecifier, languageRules.getName);
            const pointsTo = getName(stringFragment, languageRules.getName);
            const relativeFilePathRegex = new RegExp(
              '^(?:..?[\\/])[^<>:"|?*\n]+$'
            );
            // relative filepath
            if (
              name &&
              pointsTo &&
              relativeFilePathRegex.test(pointsTo) &&
              fileGroup instanceof Group &&
              fileGroup.filePath
            ) {
              let importedFilePath = path.resolve(
                path.dirname(fileGroup.filePath),
                pointsTo
              );
              const baseDirectory = path.dirname(importedFilePath);
              // if file has no extension, search directory for matching filename
              if (!path.extname(importedFilePath)) {
                const files = fs.readdirSync(baseDirectory);
                const fileNameWithoutExt = path.basename(pointsTo);
                const matchedFile = files.find((file) =>
                  file.startsWith(fileNameWithoutExt)
                );
                if (matchedFile) {
                  importedFilePath = path.join(baseDirectory, matchedFile);
                }
              }
              variables.push(
                new Variable(
                  name,
                  importedFilePath,
                  getLineNumber(importSpecifier)
                )
              );
            }
          }
        }
    }
  }

  if (parent instanceof Group && parent.groupType === GroupType.CLASS) {
    variables.push(new Variable("this", parent.token, parent.lineNumber));
  }

  return variables;
}

/**
 * Find the Node that the Call is related to.
 * Create an Edge between the 2 Nodes.
 *
 * Types of Call Expressions
 * (1) sum() -> resolve to node / import
 * (2) Object.assign() -> resolve to class / import
 * (2) this.articleService.findAll() -> resolve to ArticleService class
 *
 * @returns {Edge}
 */
export function findLinkForCall(call, nodeA, allNodes) {
  for (const node of allNodes) {
    /**
     * Class injection for NestJS
     * I have variable: articleService -> class ArticleService
     * I have call: findAll -> articleService
     */
    for (const variable of node.variables) {
      if (
        call.isAttribute() &&
        variable.token === call.ownerToken &&
        variable.pointsTo instanceof Group
      ) {
        // search through class methods
        const classNode = variable.pointsTo;
        for (const node of classNode.nodes) {
          if (node.token === call.token) {
            return new Edge(nodeA, node);
          }
        }
      }

      /**
       * for variables from import statements
       * I have variable: findAll -> Group: article.service.ts
       * I have call: findAll -> null
       */
      if (
        !call.isAttribute() &&
        variable.token === call.token &&
        !call.ownerToken &&
        variable.pointsTo instanceof Group &&
        variable.pointsTo.groupType === GroupType.FILE
      ) {
        for (const fileNode of variable.pointsTo.nodes) {
          if (fileNode.token === call.token) {
            console.log(variable.toString());
            return new Edge(nodeA, fileNode);
          }
        }
      }
    }

    // calling another function
    if (!call.isAttribute() && call.token === node.token) {
      return new Edge(nodeA, node);
    }

    // calling a function in the file space
    if (
      !call.isAttribute() &&
      call.token === node.token &&
      node.parent instanceof Group &&
      node.parent.groupType === GroupType.FILE
    ) {
      return new Edge(nodeA, node);
    }
  }
  return null;
}

export function findLinks(nodeA, allNodes) {
  const links = [];
  for (const call of nodeA.calls) {
    const link = findLinkForCall(call, nodeA, allNodes);
    if (link) {
      links.push(link);
    }
  }

  /* for (const variable of nodeA.variables) {
    // e.g. let article = new ArticleEntity()
    if (variable.pointsTo instanceof Group) {
      links.push(new Edge(nodeA, variable.pointsTo));
    }
  } */

  return links;
}

export function getFirstChildOfType(node, target) {
  if (!node) {
    return null;
  }
  for (let i = 0; i < node.childCount; i++) {
    if (node.child(i)?.type === target) {
      return node.child(i);
    }
  }

  return null;
}

export function getAllChildrenOfType(node, target) {
  if (!node) {
    return [];
  }
  const ret = [];
  for (let i = 0; i < node.childCount; i++) {
    if (node.child(i)?.type === target) {
      ret.push(node.child(i));
    }
  }
  return ret;
}

export function getLineNumber(node) {
  return node.startPosition?.row + 1; // change to 1 index
}

/**
 * Extracts the name of a node based on configurable rules.
 *
 * - "childType" → Defines which child node to extract.
 * - "delegate" → If true, recursively calls getName on the child node.
 * - "fieldName" → Extracts text from a specific field within the child node.
 * - "useText" → Uses the .text property directly if no specific field is needed.
 * - "fallbackFields" → Specifies alternative field names to check if no rule matches.
 *
 * @param {SyntaxNode} node - The AST node to extract the name from.
 * @param {Record<string, any>} getNameRules - Configuration defining node extraction rules
 * @returns {string | null} - The extracted name or null if no match is found.
 */
export function getName(node, getNameRules) {
  if (!getNameRules) {
    throw new Error("getName rules not defined in JSON file!");
  }
  const nodeTypeConfig = getNameRules[node.type];

  if (nodeTypeConfig) {
    const child = getFirstChildOfType(node, nodeTypeConfig.childType);

    if (!child) {
      return null;
    }

    if (nodeTypeConfig.delegate) {
      return getName(child, getNameRules);
    }

    if (nodeTypeConfig.useText) {
      return child.text;
    }

    if (nodeTypeConfig.fieldName) {
      return child.childForFieldName(nodeTypeConfig.fieldName)?.text ?? null;
    }
  }

  for (const field of getNameRules.fallbackFields) {
    const fieldText = node.childForFieldName(field)?.text;
    if (fieldText) {
      return fieldText;
    }

    const firstChild = getFirstChildOfType(node, field);
    if (firstChild?.text) {
      return firstChild.text;
    }
  }

  return node.text ?? null;
}

/**
 * Given an AST for the entire file, generate a file group
 * complete with subgroups, nodes, etc.
 */
export function makeFileGroup(node, filePath, fileName, languageRules) {
  const {
    groups: subgroupTrees,
    nodes: nodeTrees,
    body,
  } = Language.separateNamespaces(node, languageRules);
  const fileGroup = new Group({
    groupType: GroupType.FILE,
    token: fileName,
    lineNumber: 0,
    filePath,
  });
  for (const node of nodeTrees) {
    const nodeList = Language.makeNodes(node, fileGroup, languageRules);
    for (const subnode of nodeList) {
      fileGroup.addNode(subnode);
    }
  }

  const rootNode = Language.makeRootNode(body, fileGroup, languageRules);
  if (rootNode) {
    fileGroup.addNode(rootNode, true);
  }

  for (const subgroup of subgroupTrees) {
    const newSubgroup = Language.makeClassGroup(
      subgroup,
      fileGroup,
      languageRules
    );
    fileGroup.addSubgroup(newSubgroup);
  }

  return fileGroup;
}
/**
 * Specially for NestJS injected dependencies.
 * e.g. constructor(private readonly articleService: ArticleService) {}
 * return Variable(token=articleService, pointsTo=ArticleService)
 *
 * Processes a required parameter in a constructor and extracts its information.
 * If the parameter includes an identifier and a type annotation, a Variable object is created.
 * Otherwise, it returns null.
 *
 * @param node - TreeSitter RequiredParameterNode
 * @returns {Variable|null}
 */
export function processConstructorRequiredParameter(node) {
  const identifier = getFirstChildOfType(node, "identifier");
  const typeAnnotation = getFirstChildOfType(node, "type_annotation");
  if (!identifier || !typeAnnotation) {
    return null;
  }
  const typeIdentifier = getFirstChildOfType(typeAnnotation, "type_identifier");
  if (!typeIdentifier) {
    return null;
  }
  return new Variable(
    identifier.text,
    typeIdentifier.text,
    getLineNumber(node)
  );
}
