import fs from "fs";
import path from "path";
import Parser, { SyntaxNode, Tree } from "tree-sitter";
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
  Node,
  VariableType,
} from "./model";
import { NodeType } from "@shared/node.types";
import { Language, GLOBAL } from "./language";
import { getNameConfig, LanguageRules, NodeConfig } from "./rules";

/**
 * Determines the appropriate language for a file
 * @param filePath
 * @returns Language
 */
function getLanguageForFile(filePath: string): any | null {
  if (filePath.endsWith(".ts")) {
    return TypeScript.typescript;
  }
  if (filePath.endsWith(".tsx")) {
    return TypeScript.tsx;
  }
  if (filePath.endsWith(".py")) {
    return Python;
  }
  if (filePath.endsWith(".java")) {
    return Java;
  }
  if (filePath.endsWith(".cpp")) {
    return Cpp;
  }
  if (filePath.endsWith(".hpp")) {
    return Cpp;
  }
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
function parseFileToAST(
  parser: Parser,
  filePath: string,
  file: string,
  skipParseErrors: boolean
): Tree | null {
  try {
    const sourceCode = fs.readFileSync(filePath, "utf-8");
    return parser.parse(sourceCode);
  } catch (ex) {
    if (skipParseErrors) {
      console.warn(
        `Could not parse ${file}. Skipping...`,
        (ex as Error).message
      );
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
 * @returns A promise resolving to a list of [filePath, filename, AST] tuples.
 */
export function parseFilesToASTs(
  folderPath: string,
  skipParseErrors: boolean = true
): [string, string, Tree][] {
  const parser = new Parser();
  const fileASTTrees: [string, string, Tree][] = [];

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
        if (!language) {
          continue;
        }
        parser.setLanguage(language);

        const ast = parseFileToAST(parser, filePath, file, skipParseErrors);
        if (ast) {
          fileASTTrees.push([filePath, file, ast]);
        }
      }
    }
  } catch (err) {
    console.error("Error reading folder:", (err as Error).message);
    throw err;
  }

  return fileASTTrees;
}

/**
 * Walk through the ast tree and return all nodes except decorators and their children
 */
export function walk(body: SyntaxNode[] | SyntaxNode): SyntaxNode[] {
  let ret: SyntaxNode[] = [];
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
 * MAYBE: label calls that have 'this'
 *
 * @returns {string}
 */
export function processMemberExpression(node: SyntaxNode): {
  token?: string;
  pointsTo?: string;
} {
  const objectNode = node.childForFieldName("object");
  const propertyNode = node.childForFieldName("property");

  if (!objectNode || !propertyNode) {
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
export function processCallExpression(node: SyntaxNode): Call | null {
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
      if (token && pointsTo) {
        return new Call({
          token,
          ownerToken: pointsTo,
          startPosition: node.startPosition,
          endPosition: node.endPosition,
          text: node.text,
        });
      }

    // for C++
    case "field_expression":
      const identifier = getFirstChildOfType(func, "identifier");
      const fieldIdentifier = getFirstChildOfType(func, "field_identifier");
      if (identifier && fieldIdentifier) {
        return new Call({
          token: fieldIdentifier.text,
          ownerToken: identifier.text,
          startPosition: node.startPosition,
          endPosition: node.endPosition,
          text: node.text,
        });
      }
  }

  return null;
}

/**
 * For Java because the tree-sitter outputs method_invocation instead of call_expression
 * And they have a different structure
 * (1) getVenueById(id) => no objectNode
 * (2) repo.findById(id).orElseThrow(() -> new VenueNotFoundException()) = method_invocation
 * (3) repo.findAll() = objectNode.nameNode
 *
 * @param {*} node
 * @returns {Call | null}
 */
export function processMethodInvocation(node: SyntaxNode): Call | null {
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
export function makeCalls(body: SyntaxNode[], getNameRules: getNameConfig) {
  const calls = [];

  for (const node of walk(body)) {
    switch (node.type) {
      case "call_expression":
        const call = processCallExpression(node);
        if (call) {
          calls.push(call);
        }
        break;
      // equivalent of call_expressions in C++
      case "method_invocation":
        const mCall = processMethodInvocation(node);
        if (mCall) {
          calls.push(mCall);
        }
        break;
      // JSX opening elements e.g. <MyComponent>
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
      // JSX self-closing elements e.g. <MyComponent />
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
export function processVariableDeclaration(node: SyntaxNode): Variable | null {
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
      if (token && pointsTo) {
        return new Variable({
          token,
          pointsTo,
          startPosition: node.startPosition,
          endPosition: node.endPosition,
          variableType: VariableType.CALL_EXPRESSION,
        });
      }
  }

  return null;
}

function makeLocalVariablesDeclaration(node: SyntaxNode) {
  const typeIdentifier = getFirstChildOfType(node, "type_identifier");
  const identifier = getFirstChildOfType(node, "identifier");
  if (typeIdentifier && identifier) {
    return new Variable({
      token: identifier.text,
      pointsTo: typeIdentifier.text,
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      variableType: VariableType.CALL_EXPRESSION,
    });
  }
  return null;
}

function isRelativeFilePath(path: string): boolean {
  const relativeFilePathRegex = /^(?:..?[\\/])[^<>:"|?*\n]+$/;
  return relativeFilePathRegex.test(path);
}

/**
 * resolve relative filepath
 * (1) pointsTo="./article.service" => without extension
 * (2) pointsTo="./article.service.ts" => with extension
 * (3) pointsTo="./dto" => folder
 * output=/User/fyp/samples/nestjs-realworld-example-app/src/article/article.service.ts
 * output=/User/fyp/samples/nestjs-realworld-example-app/src/article/dto
 */
function resolveRelativeFilePath(filePath: string, pointsTo: string): string {
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
  namedImports: SyntaxNode,
  importedFilePath: string,
  filePath: string,
  languageRules: LanguageRules
): Variable[] {
  const importSpecifiers = getAllChildrenOfType(
    namedImports,
    "import_specifier"
  );

  const variables = [];
  for (const importSpecifier of importSpecifiers) {
    const name = getName(importSpecifier, languageRules.getName);
    if (!name || !filePath) {
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
  namespaceImport: SyntaxNode,
  importedFilePath: string,
  languageRules: LanguageRules
): Variable[] {
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

function makeLocalVariablesImportStatement(
  node: SyntaxNode,
  parent: Node | Group,
  languageRules: LanguageRules
): Variable[] {
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
  if (!firstChild) {
    return [];
  }

  switch (firstChild.type) {
    case "named_imports":
      return makeLocalVariablesImportStatementNamedImport(
        firstChild,
        importedFilePath,
        fileGroup.filePath,
        languageRules
      );
    case "namespace_import":
      return makeLocalVariablesImportStatementNamespaceImport(
        firstChild,
        importedFilePath,
        languageRules
      );
  }
  return [];
}

export function makeLocalVariables(
  tree: SyntaxNode[],
  parent: Node | Group,
  languageRules: LanguageRules
) {
  let variables: Variable[] = [];

  for (const node of walk(tree)) {
    switch (node.type) {
      case "variable_declarator":
        const var1 = processVariableDeclaration(node);
        if (var1) {
          variables.push(var1);
        }
        break;
      // A a;
      // a.callB();
      case "declaration":
        const var2 = makeLocalVariablesDeclaration(node);
        if (var2) {
          variables.push(var2);
        }
        break;
      // import { SyntaxNode } from 'tree-sitter'
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

function findLinkForCallThis(call: Call, nodeA: Node) {
  if (call.ownerToken === "this" && nodeA.parent instanceof Group) {
    for (const node of nodeA.parent.nodes) {
      if (node.token === call.token) {
        node.functionCalls.push(call);
        return new Edge(nodeA, node);
      }
    }
  }
}

function findMethod(call: Call, nodeA: Node, classNode: Group) {
  for (const node of classNode.nodes) {
    if (node.token === call.token) {
      node.functionCalls.push(call);
      return new Edge(nodeA, node);
    }
  }
}

function findLinkForCallClassInjection(call: Call, nodeA: Node) {
  /**
   * Class injection for NestJS
   * I have variable: articleService -> class ArticleService under constructor
   * I have call: findAll -> articleService
   *
   * Class injection for Java
   * I have variable: service -> class VenueService
   * I have call: findAll -> service
   */
  if (nodeA.parent instanceof Group) {
    for (const node of nodeA.parent.nodes) {
      for (const variable of node.variables) {
        if (
          variable.variableType === VariableType.INJECTION &&
          variable.token === call.ownerToken &&
          variable.pointsTo instanceof Group
        ) {
          // search through class methods
          const classNode = variable.pointsTo;
          return findMethod(call, nodeA, classNode);
        }
      }
    }
  }
}

function findLinkForCallNamespaceImport(
  call: Call,
  nodeA: Node,
  globalNode: Node
) {
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
}

function findLinkForCallFunctionCall(call: Call, nodeA: Node) {
  // calling another function in the same file (priority)
  if (nodeA.parent instanceof Group) {
    for (const node2 of nodeA.parent.nodes) {
      if (call.token === node2.token && node2.nodeType === NodeType.FUNCTION) {
        node2.functionCalls.push(call);
        return new Edge(nodeA, node2);
      }
    }
  }
}

function findGlobalNode(fileGroup: Group | null, allNodes: Node[]) {
  return allNodes.find(
    (node) =>
      node.token === GLOBAL &&
      node.getFileGroup()?.filePath === fileGroup?.filePath
  );
}

function findCalledFunctionInImportedFunctions(
  call: Call,
  nodeA: Node,
  globalNode: Node
) {
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
}

function findLinkForCallImportStatement(
  call: Call,
  nodeA: Node,
  globalNode: Node
) {
  /**
   * calling a function from import statements
   * I have variable: findAll -> Group: article.service.ts under (global)
   * I have call: findAll -> null
   */
  return findCalledFunctionInImportedFunctions(call, nodeA, globalNode);
}

function findLinkForCallFunction(call: Call, nodeA: Node, allNodes: Node[]) {
  for (const node of allNodes) {
    if (call.token === node.token && node.nodeType === NodeType.FUNCTION) {
      node.functionCalls.push(call);
      return new Edge(nodeA, node);
    }
  }
}

function findLinkForAttributeCall(
  call: Call,
  nodeA: Node,
  globalNode: Node | null
): Edge | null {
  const edge1 = findLinkForCallThis(call, nodeA);
  if (edge1) {
    return edge1;
  }
  if (globalNode) {
    const edge6 = findLinkForCallNamespaceImport(call, nodeA, globalNode);
    if (edge6) {
      return edge6;
    }
  }
  const edge2 = findLinkForCallClassInjection(call, nodeA);
  if (edge2) {
    return edge2;
  }
  return null;
}

function findLinkForNonAttributeCall(
  call: Call,
  nodeA: Node,
  globalNode: Node | null,
  allNodes: Node[]
): Edge | null {
  const edge3 = findLinkForCallFunctionCall(call, nodeA);
  if (edge3) {
    return edge3;
  }
  if (globalNode) {
    const edge4 = findLinkForCallImportStatement(call, nodeA, globalNode);
    if (edge4) {
      return edge4;
    }
  }
  const edge5 = findLinkForCallFunction(call, nodeA, allNodes);
  if (edge5) {
    return edge5;
  }
  return null;
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
export function findLinkForCall(
  call: Call,
  nodeA: Node,
  allNodes: Node[]
): Edge | null {
  const fileGroup = nodeA.getFileGroup();
  const globalNode = findGlobalNode(fileGroup, allNodes) ?? null;
  if (call.isAttribute()) {
    return findLinkForAttributeCall(call, nodeA, globalNode);
  } else {
    return findLinkForNonAttributeCall(call, nodeA, globalNode, allNodes);
  }
}

export function findLinks(nodeA: Node, allNodes: Node[]) {
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

export function getFirstChildOfType(node: SyntaxNode | null, target: string) {
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

export function getAllChildrenOfType(
  node: SyntaxNode | null,
  target: string
): SyntaxNode[] {
  if (!node) {
    return [];
  }
  const ret: SyntaxNode[] = [];
  for (let i = 0; i < node.childCount; i++) {
    let child = node.child(i);
    if (child && child.type === target) {
      ret.push(child);
    }
  }
  return ret;
}

// Recursive function to process nested NodeConfig relationships
function getNameUsingConfig(
  node: SyntaxNode,
  config: NodeConfig,
  getNameRules: Record<any, any>
): string | null {
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
export function getName(node: SyntaxNode, getNameRules: Record<string, any>) {
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
export function makeFileGroup(
  node: SyntaxNode,
  filePath: string,
  fileName: string,
  languageRules: LanguageRules
): Group {
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
export function processConstructorRequiredParameter(node: SyntaxNode) {
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

export function toGroupTypeIgnoreCase(value: string): GroupType {
  const groupType = Object.values(GroupType).find(
    (gt) => gt.toLowerCase() === value.toLowerCase()
  );
  if (!groupType) {
    throw new Error("Invalid groupType in rules!");
  }
  return groupType;
}

export function toNodeTypeIgnoreCase(value: string): NodeType {
  const nodeType = Object.values(NodeType).find(
    (nt) => nt.toLowerCase() === value.toLowerCase()
  );
  if (!nodeType) {
    throw new Error("Invalid nodeType in rules!");
  }
  return nodeType;
}
