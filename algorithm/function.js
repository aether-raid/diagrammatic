import fs from "fs";
import path from "path";
import Parser from "tree-sitter";
import TypeScript from "tree-sitter-typescript";
import Python from "tree-sitter-python";
import Java from "tree-sitter-java";
import Cpp from "tree-sitter-cpp";

import {
  Variable,
  Call,
  Group,
  Edge,
  GroupType,
  NodeType,
  VariableType,
} from "./model.js";
import { Language, GLOBAL } from "./language.js";

/**
 * Determines the appropriate language for a file
 * @param filePath
 * @returns Language
 */
function getLanguageForFile(filePath) {
  if (filePath.endsWith(".ts")) return TypeScript.typescript;
  if (filePath.endsWith(".tsx")) return TypeScript.tsx;
  if (filePath.endsWith(".py")) return Python;
  if (filePath.endsWith(".java")) return Java;
  if (filePath.endsWith(".cpp")) return Cpp;
  if (filePath.endsWith(".hpp")) return Cpp;
  return null;
}

/**
 * Parses a file into an AST with error handling
 * @param parser
 * @param filePath
 * @param file
 * @param skipParseErrors
 * @returns
 */
function parseFileToAST(parser, filePath, file, skipParseErrors) {
  try {
    const sourceCode = fs.readFileSync(filePath, "utf-8");
    return parser.parse(sourceCode);
  } catch (ex) {
    if (skipParseErrors) {
      console.warn(`Could not parse ${file}. Skipping...`, ex.message);
      return null;
    }
    throw ex;
  }
}

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
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        // If it's a directory, recurse into it
        const subdirectoryFiles = parseFilesToASTs(filePath, skipParseErrors);
        fileASTTrees.push(...subdirectoryFiles);
      } else if (fileStat.isFile()) {
        // check if we support the language
        const language = getLanguageForFile(filePath);
        if (!language) continue;
        parser.setLanguage(language);

        const ast = parseFileToAST(parser, filePath, file, skipParseErrors);
        if (ast) fileASTTrees.push([filePath, file, ast]);
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

  if (!objectNode) {
    return {};
  }

  switch (objectNode.type) {
    case "identifier":
      return { pointsTo: objectNode.text, token: propertyNode.text };
    case "this":
      return { pointsTo: "this", token: propertyNode.text };
    case "member_expression":
      const { token } = processMemberExpression(objectNode);
      return { token: propertyNode.text, pointsTo: token };
  }

  return {};
}

/**
 * Types of Call Expressions
 * (1) const total = sum(a+b) = Identifier
 * (2) const users = this.userRepository.getUsers() = MemberExpression
 *
 * @returns {Call | null}
 */
export function processCallExpression(node) {
  const func = node.childForFieldName("function");

  if (!func) {
    return null;
  }

  switch (func.type) {
    case "identifier":
      return new Call({
        token: func.text,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        text: node.text,
      });
    case "member_expression":
      const { token, pointsTo } = processMemberExpression(func);
      return new Call({
        token,
        ownerToken: pointsTo,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        text: node.text,
      });
    // for C++
    case "field_expression":
      const identifier = getFirstChildOfType(func, "identifier");
      if (identifier) {
        return new Call({
          token: getFirstChildOfType(func, "field_identifier")?.text,
          ownerToken: identifier.text,
          startPosition: node.startPosition,
          endPosition: node.endPosition,
          text: node.text,
        });
      }
    default:
      return null;
  }
}

/**
 * For Java because the tree-sitter outputs method_invocation instead of call_expression
 * And they have a different structure
 * @param {*} node
 * @returns {Call | null}
 */
export function processMethodInvocation(node) {
  const objectNode = node.childForFieldName("object");
  const nameNode = node.childForFieldName("name");

  if (!nameNode) {
    return null;
  }
  // getVenueById(id)
  if (!objectNode) {
    return new Call({
      token: nameNode.text,
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      text: node.text,
    });
  }

  switch (objectNode.type) {
    // repo.findById(id).orElseThrow(() -> new VenueNotFoundException())
    case "method_invocation":
      return processMethodInvocation(objectNode);
    // repo.findAll()
    case "identifier":
      return new Call({
        token: nameNode.text,
        ownerToken: objectNode.text,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        text: node.text,
      });
    default:
      return null;
  }
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
export function makeCalls(body, getNameRules) {
  const calls = [];

  for (const node of walk(body)) {
    switch (node.type) {
      case "call_expression":
        const call = processCallExpression(node);
        if (call) {
          calls.push(call);
        }
        break;
      case "method_invocation":
        const mCall = processMethodInvocation(node);
        if (mCall) {
          calls.push(mCall);
        }
        break;
      case "jsx_opening_element":
        const token = getName(node, getNameRules);
        if (token) {
          calls.push(
            new Call({
              token,
              startPosition: node.startPosition,
              endPosition: node.endPosition,
              text: node.text,
            })
          );
        }
        break;
      case "jsx_self_closing_element":
        const token2 = getName(node, getNameRules);
        if (token2) {
          calls.push(
            new Call({
              token: token2,
              startPosition: node.startPosition,
              endPosition: node.endPosition,
              text: node.text,
            })
          );
        }
        break;
      default:
        continue;
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
      return new Variable({
        token: name.text,
        pointsTo: identifierNode.text,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        variableType: VariableType.OBJECT_INSTANTIATION,
      });
    case "call_expression":
      const call = processCallExpression(value);
      return new Variable({
        token: name.text,
        pointsTo: call,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        variableType: VariableType.CALL_EXPRESSION,
      });
    case "await_expression":
      const callExpressionNode = getFirstChildOfType(value, "call_expression");
      if (!callExpressionNode) {
        return null;
      }
      const awaitCall = processCallExpression(callExpressionNode);
      return new Variable({
        token: name.text,
        pointsTo: awaitCall,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        variableType: VariableType.CALL_EXPRESSION,
      });
    case "member_expression":
      const { token, pointsTo } = processMemberExpression(value);
      return new Variable({
        token,
        pointsTo,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        variableType: VariableType.CALL_EXPRESSION,
      });
  }

  return null;
}

function isRelativeFilePath(path) {
  const relativeFilePathRegex = /^(?:..?[\\/])[^<>:"|?*\n]+$/;
  return relativeFilePathRegex.test(path);
}

/**
 * relative filepath
 * (1) pointsTo="./article.service" => without extension
 * (2) pointsTo="./article.service.ts" => with extension
 * (3) pointsTo="./dto" => folder
 * output=/User/fyp/samples/nestjs-realworld-example-app/src/article/article.service.ts
 * output=/User/fyp/samples/nestjs-realworld-example-app/src/article/dto
 */
function resolveRelativeFilePath(filePath, pointsTo) {
  let importedFilePath = path.resolve(path.dirname(filePath), pointsTo);

  // if file has no extension, search directory for matching filename
  const baseDirectory = path.dirname(importedFilePath);
  if (fs.existsSync(baseDirectory)) {
    const files = fs.readdirSync(baseDirectory);
    const fileNameWithoutExt = path.basename(pointsTo);
    const matchedFile = files.find((file) => {
      const baseFilePath = path.basename(file);
      return baseFilePath.startsWith(fileNameWithoutExt);
    });
    if (matchedFile) {
      return path.join(baseDirectory, matchedFile);
    }
  }

  return importedFilePath;
}

/**
 * import { SyntaxNode, Tree } from 'tree-sitter'
 *   - import_statement (11:0 - 11:68)
      - import (11:0 - 11:6)
      - type (11:7 - 11:11)
      - import_clause (11:12 - 11:53)
        - named_imports (11:12 - 11:53)
          - { (11:12 - 11:13)
          - import_specifier (11:14 - 11:25)
            - identifier (11:14 - 11:25)
          - , (11:25 - 11:26)
          - import_specifier (11:44 - 11:51)
            - identifier (11:44 - 11:51)
          - } (11:52 - 11:53)
      - from (11:54 - 11:58)
      - string (11:59 - 11:68)
        - ' (11:59 - 11:60)
        - string_fragment (11:60 - 11:67)
        - ' (11:67 - 11:68)
  */
function makeLocalVariablesImportStatementNamedImport(
  namedImports,
  importedFilePath,
  fileGroup,
  languageRules
) {
  const importSpecifiers = getAllChildrenOfType(
    namedImports,
    "import_specifier"
  );

  const variables = [];
  for (const importSpecifier of importSpecifiers) {
    const name = getName(importSpecifier, languageRules.getName);
    if (!name || !fileGroup.filePath) {
      continue;
    }

    variables.push(
      new Variable({
        token: name,
        pointsTo: importedFilePath,
        startPosition: importSpecifier.startPosition,
        endPosition: importSpecifier.endPosition,
        variableType: VariableType.NAMED_IMPORT,
      })
    );
  }
  return variables;
}

/**
 * import * as utils from '../lib/utils'
 * - import_statement (12:0 - 12:32)
    - import (12:0 - 12:6)
    - import_clause (12:7 - 12:17)
      - namespace_import (12:7 - 12:17)
        - * (12:7 - 12:8)
        - as (12:9 - 12:11)
        - identifier (12:12 - 12:17)
    - from (12:18 - 12:22)
    - string (12:23 - 12:32)
      - ' (12:23 - 12:24)
      - string_fragment (12:24 - 12:31)
      - ' (12:31 - 12:32)
  */
function makeLocalVariablesImportStatementNamespaceImport(
  namespaceImport,
  importedFilePath,
  languageRules
) {
  const token = getName(namespaceImport, languageRules.getName);
  if (!token) {
    return [];
  }

  return [
    new Variable({
      token,
      pointsTo: importedFilePath,
      startPosition: namespaceImport.startPosition,
      endPosition: namespaceImport.endPosition,
      variableType: VariableType.NAMESPACE_IMPORT,
    }),
  ];
}

function makeLocalVariablesImportStatement(node, parent, languageRules) {
  const importClause = getFirstChildOfType(node, "import_clause");
  const string = getFirstChildOfType(node, "string");
  const stringFragment = getFirstChildOfType(string, "string_fragment");
  const fileGroup = parent.getFileGroup();

  if (!importClause || !stringFragment || !fileGroup) {
    return [];
  }

  const pointsTo = stringFragment.text;
  if (!pointsTo || !isRelativeFilePath(pointsTo)) {
    return [];
  }

  const importedFilePath = resolveRelativeFilePath(
    fileGroup.filePath,
    pointsTo
  );

  const firstChild = importClause.firstChild;
  switch (firstChild.type) {
    case "named_imports":
      return makeLocalVariablesImportStatementNamedImport(
        firstChild,
        importedFilePath,
        fileGroup,
        languageRules
      );
    case "namespace_import":
      return makeLocalVariablesImportStatementNamespaceImport(
        firstChild,
        importedFilePath,
        languageRules
      );
  }
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
        break;
      // A a;
      // a.callB();
      case "declaration":
        const typeIdentifier = getFirstChildOfType(node, "type_identifier");
        const identifier = getFirstChildOfType(node, "identifier");
        if (typeIdentifier && identifier) {
          variables.push(
            new Variable({
              token: identifier.text,
              pointsTo: typeIdentifier.text,
              startPosition: node.startPosition,
              endPosition: node.endPosition,
              variableType: VariableType.CALL_EXPRESSION,
            })
          );
        }
        break;
      case "import_statement":
        const varArray = makeLocalVariablesImportStatement(
          node,
          parent,
          languageRules
        );
        if (varArray) {
          variables.push(...varArray);
        }
        break;
    }
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
  const fileGroup = nodeA.getFileGroup();
  const globalNode = allNodes.find(
    (node) =>
      node.token === GLOBAL &&
      node.getFileGroup().filePath === fileGroup.filePath
  );

  if (call.isAttribute()) {
    /**
     * Call functions in the same class
     * e.g. this.fetchBeeBalance()
     */
    if (call.ownerToken === "this") {
      for (const node of nodeA.parent.nodes) {
        if (node.token === call.token) {
          node.functionCalls.push(call);
          return new Edge(nodeA, node);
        }
      }
    }

    /**
     * Calling functions from namespace import
     * I have variable: utils -> utils.ts
     * I have call: utils.ctfFlag()
     */
    for (const variable of globalNode.variables) {
      if (
        variable.token === call.ownerToken &&
        variable.pointsTo instanceof Group &&
        variable.pointsTo.groupType === GroupType.FILE
      ) {
        for (const fileNode of variable.pointsTo.nodes) {
          if (fileNode.token === call.token) {
            fileNode.functionCalls.push(call);
            return new Edge(nodeA, fileNode);
          }
        }
      }
    }

    if (nodeA.parent instanceof Group) {
      /**
       * Class injection for NestJS
       * I have variable: articleService -> class ArticleService under constructor
       * I have call: findAll -> articleService
       *
       * Class injection for Java
       * I have variable: service -> class VenueService
       * I have call: findAll -> service
       */
      for (const node of nodeA.parent.nodes) {
        for (const variable of node.variables) {
          if (
            variable.variableType === VariableType.INJECTION &&
            variable.token === call.ownerToken &&
            variable.pointsTo instanceof Group
          ) {
            // search through class methods
            const classNode = variable.pointsTo;
            for (const node of classNode.nodes) {
              if (node.token === call.token) {
                node.functionCalls.push(call);
                return new Edge(nodeA, node);
              }
            }
          }
        }
      }
    }
  }

  if (!call.isAttribute()) {
    /**
     * calling a function from import statements
     * I have variable: findAll -> Group: article.service.ts under (global)
     * I have call: findAll -> null
     */
    for (const variable of globalNode.variables) {
      if (
        variable.token === call.token &&
        variable.pointsTo instanceof Group &&
        variable.pointsTo.groupType === GroupType.FILE
      ) {
        for (const fileNode of variable.pointsTo.nodes) {
          if (fileNode.token === call.token) {
            fileNode.functionCalls.push(call);
            return new Edge(nodeA, fileNode);
          }
        }
      }
    }

    // calling another function in the same file (priority)
    if (nodeA.parent instanceof Group) {
      for (const node2 of nodeA.parent.nodes) {
        if (
          call.token === node2.token &&
          node2.nodeType === NodeType.FUNCTION
        ) {
          node2.functionCalls.push(call);
          return new Edge(nodeA, node2);
        }
      }
    }

    // calling another function
    for (const node of allNodes) {
      if (call.token === node.token && node.nodeType === NodeType.FUNCTION) {
        node.functionCalls.push(call);
        return new Edge(nodeA, node);
      }
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

  for (const variable of nodeA.variables) {
    // e.g. let article = new ArticleEntity()
    if (
      variable.variableType === VariableType.OBJECT_INSTANTIATION &&
      variable.pointsTo instanceof Group &&
      variable.pointsTo.groupType !== GroupType.FILE
    ) {
      links.push(new Edge(nodeA, variable.pointsTo));
    }
  }

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

// Recursive function to process nested NodeConfig relationships
function getNameUsingConfig(node, config, getNameRules) {
  if (config.childTypes) {
    for (const [childType, childConfig] of Object.entries(config.childTypes)) {
      const child = getFirstChildOfType(node, childType);
      if (child) {
        return getNameUsingConfig(child, childConfig, getNameRules);
      }
    }
  }

  if (config.delegate) {
    return getName(node, getNameRules);
  }

  if (config.useText) {
    return node.text;
  }

  if (config.fieldName) {
    return node.childForFieldName(config.fieldName)?.text ?? null;
  }

  return null;
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
    return getNameUsingConfig(node, nodeTypeConfig, getNameRules);
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

  return null;
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
    startPosition: node.startPosition,
    endPosition: node.endPosition,
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
  return new Variable({
    token: identifier.text,
    pointsTo: typeIdentifier.text,
    startPosition: node.startPosition,
    endPosition: node.endPosition,
    variableType: VariableType.INJECTION,
  });
}
