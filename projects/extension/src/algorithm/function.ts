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
  NodeType,
  VariableType,
} from "./model";
import { Language, GLOBAL } from "./language";
import { LanguageRules } from "./rules";

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
      });
    case "member_expression":
      const { token, pointsTo } = processMemberExpression(func);
      if (token && pointsTo) {
        return new Call({
          token,
          ownerToken: pointsTo,
          startPosition: node.startPosition,
          endPosition: node.endPosition,
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
export function makeCalls(body: SyntaxNode[]) {
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

function createImportVariable(
  importSpecifier: SyntaxNode,
  pointsTo: string,
  fileGroup: Group,
  languageRules: LanguageRules
) {
  /**
   * relative filepath
   * e.g. "./article.service" => without extension
   * e.g. "./dto" => folder
   * (1) import classes from file
   * (2) import functions from file
   * (3) import from folder
   * output variable.pointsTo: /User/fyp/samples/nestjs-realworld-example-app/src/article/article.service.ts
   * output variable.pointsTo: User/fyp/samples/nestjs-realworld-example-app/src/article/dto
   */
  const name = getName(importSpecifier, languageRules.getName);
  if (!name || !fileGroup.filePath) {
    return;
  }

  let importedFilePath = path.resolve(
    path.dirname(fileGroup.filePath),
    pointsTo
  );
  const baseDirectory = path.dirname(importedFilePath);
  // if file has no extension, search directory for matching filename
  if (fs.existsSync(baseDirectory)) {
    const files = fs.readdirSync(baseDirectory);
    const fileNameWithoutExt = path.basename(pointsTo);
    const matchedFile = files.find((file) => {
      const baseFilePath = path.basename(file);
      return baseFilePath.startsWith(fileNameWithoutExt);
    });
    if (matchedFile) {
      importedFilePath = path.join(baseDirectory, matchedFile);
    }

    return new Variable({
      token: name,
      pointsTo: importedFilePath,
      startPosition: importSpecifier.startPosition,
      endPosition: importSpecifier.endPosition,
      variableType: VariableType.RELATIVE_IMPORT,
    });
  }
  return null;
}

function makeLocalVariablesImportStatement(
  node: SyntaxNode,
  parent: Node | Group,
  languageRules: LanguageRules
) {
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
    const pointsTo = stringFragment.text;
    for (const importSpecifier of importSpecifiers) {
      if (pointsTo && isRelativeFilePath(pointsTo)) {
        const variable = createImportVariable(
          importSpecifier,
          pointsTo,
          fileGroup,
          languageRules
        );
        if (variable) {
          return variable;
        }
      }
    }
  }
  return null;
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
        const var3 = makeLocalVariablesImportStatement(
          node,
          parent,
          languageRules
        );
        if (var3) {
          variables.push(var3);
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
        return new Edge(nodeA, node);
      }
    }
  }
}

function findMethod(call: Call, nodeA: Node, classNode: Group) {
  for (const node of classNode.nodes) {
    if (node.token === call.token) {
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

function findLinkForCallFunctionCall(call: Call, nodeA: Node) {
  // calling another function in the same file (priority)
  if (nodeA.parent instanceof Group) {
    for (const node2 of nodeA.parent.nodes) {
      if (call.token === node2.token && node2.nodeType === NodeType.FUNCTION) {
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
          return new Edge(nodeA, fileNode);
        }
      }
    }
  }
}

function findLinkForCallImportStatement(
  call: Call,
  nodeA: Node,
  fileGroup: Group | null,
  allNodes: Node[]
) {
  /**
   * calling a function from import statements
   * I have variable: findAll -> Group: article.service.ts under (global)
   * I have call: findAll -> null
   */
  const globalNode = findGlobalNode(fileGroup, allNodes);
  if (globalNode) {
    return findCalledFunctionInImportedFunctions(call, nodeA, globalNode);
  }
}

function findLinkForCallFunction(call: Call, nodeA: Node, allNodes: Node[]) {
  for (const node of allNodes) {
    if (call.token === node.token && node.nodeType === NodeType.FUNCTION) {
      return new Edge(nodeA, node);
    }
  }
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
  if (call.isAttribute()) {
    const edge1 = findLinkForCallThis(call, nodeA);
    if (edge1) {
      return edge1;
    }
    const edge2 = findLinkForCallClassInjection(call, nodeA);
    if (edge2) {
      return edge2;
    }
  } else {
    const edge3 = findLinkForCallFunctionCall(call, nodeA);
    if (edge3) {
      return edge3;
    }
    const edge4 = findLinkForCallImportStatement(
      call,
      nodeA,
      fileGroup,
      allNodes
    );
    if (edge4) {
      return edge4;
    }
    const edge5 = findLinkForCallFunction(call, nodeA, allNodes);
    if (edge5) {
      return edge5;
    }
  }

  return null;
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
