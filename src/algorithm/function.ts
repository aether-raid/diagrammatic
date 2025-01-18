import fs from "fs";
import path from "path";
import Parser, { SyntaxNode, Tree } from "tree-sitter";
import TypeScript from "tree-sitter-typescript";

import { Variable, Call, Group, Edge, GroupType, Node } from "./model";
import { TypeScriptAlgorithm } from "./typescript";

/**
 * Parse files in a folder and convert them to ASTs.
 *
 * @param folderPath - The folder containing the source files.
 * @param skipParseErrors - Whether to skip files that cannot be parsed.
 * @returns A promise resolving to a list of [filename, AST] tuples.
 */
export function parseFilesToASTs(
  folderPath: string,
  skipParseErrors: boolean = true
) {
  const parser = new Parser();
  parser.setLanguage(TypeScript.typescript);

  const fileASTTrees: [string, Tree][] = [];

  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      if (fs.statSync(filePath).isDirectory()) {
        // If it's a directory, recurse into it
        const subdirectoryFiles = parseFilesToASTs(filePath, skipParseErrors);
        fileASTTrees.push(...subdirectoryFiles);
      } else if (fs.statSync(filePath).isFile() && filePath.endsWith(".ts")) {
        // If it's a TypeScript file, parse it
        try {
          const sourceCode = fs.readFileSync(filePath, "utf-8");
          const ast = parser.parse(sourceCode);
          fileASTTrees.push([file, ast]);
        } catch (ex) {
          if (skipParseErrors) {
            console.warn(
              `Could not parse ${file}. Skipping...`,
              (ex as Error).message
            );
          } else {
            throw ex;
          }
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
 * TODO: only return certain node types
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
 * TODO: label calls that have 'this'
 *
 * @returns {string}
 */
export function processMemberExpression(node: SyntaxNode) {
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
export function processCallExpression(node: SyntaxNode): Call | null {
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
export function makeCalls(body: SyntaxNode[]) {
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

export function makeLocalVariables(tree: SyntaxNode[], parent: Node | Group) {
  let variables: Variable[] = [];

  for (const node of walk(tree)) {
    switch (node.type) {
      case "variable_declarator":
        const result = processVariableDeclaration(node);
        if (result) {
          variables.push(result);
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
export function findLinkForCall(
  call: Call,
  nodeA: Node,
  allNodes: Node[]
): Edge | null {
  for (const node of allNodes) {
    /**
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
        const classNode: Group = variable.pointsTo;
        for (const node of classNode.nodes) {
          if (node.token === call.token) {
            return new Edge(nodeA, node);
          }
        }
      }
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

export function findLinks(nodeA: Node, allNodes: Node[]) {
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

export function getFirstChildOfType(node: SyntaxNode | null, target: string) {
  if (!node) {
    return null;
  }
  for (let i = 0; i < node.childCount; i++) {
    if (node.child(i)?.type === target) {
      return node.child(i);
    }
  }
}

export function getAllChildrenOfType(node: SyntaxNode, target: string) {
  const ret = [];
  for (let i = 0; i < node.childCount; i++) {
    if (node.child(i)?.type === target) {
      ret.push(node.child(i));
    }
  }
  return ret;
}

export function getLineNumber(node: SyntaxNode) {
  return node.startPosition?.row + 1; // change to 1 index
}

export function getName(node: SyntaxNode) {
  switch (node.type) {
    case "export_statement":
      const lexicalDeclaration = getFirstChildOfType(
        node,
        "lexical_declaration"
      );
      if (!lexicalDeclaration) {
        break;
      }
      return getName(lexicalDeclaration);
    case "lexical_declaration":
      const variableDeclaration = getFirstChildOfType(
        node,
        "variable_declarator"
      );
      if (!variableDeclaration) {
        break;
      }
      const identifier = variableDeclaration.childForFieldName("name");
      return identifier?.text ?? null;
    case "call_expression":
      const member_expression = getFirstChildOfType(node, "member_expression");
      if (!member_expression) {
        break;
      }
      return member_expression.text;
  }
  return node.childForFieldName("name")?.text ?? null;
}

/**
 * Given an AST for the entire file, generate a file group
 * complete with subgroups, nodes, etc.
 */
export function makeFileGroup(node: SyntaxNode, fileName: string): Group {
  const {
    groups: subgroupTrees,
    nodes: nodeTrees,
    body,
  } = TypeScriptAlgorithm.separateNamespaces(node);
  const fileGroup = new Group({
    groupType: GroupType.FILE,
    token: fileName,
    lineNumber: 0,
  });
  for (const node of nodeTrees) {
    const nodeList = TypeScriptAlgorithm.makeNodes(node, fileGroup);
    for (const subnode of nodeList) {
      fileGroup.addNode(subnode);
    }
  }

  const rootNode = TypeScriptAlgorithm.makeRootNode(body, fileGroup);
  if (rootNode) {
    fileGroup.addNode(rootNode, true);
  }

  for (const subgroup of subgroupTrees) {
    const newSubgroup = TypeScriptAlgorithm.makeClassGroup(subgroup, fileGroup);
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
  return new Variable(
    identifier.text,
    typeIdentifier.text,
    getLineNumber(node)
  );
}
