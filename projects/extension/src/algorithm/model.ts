import path from "path";
import fs from "fs";
import { GLOBAL } from "./language";
import { Point } from "tree-sitter";
import { NodeType } from "@shared/node.types";

/**
 *  Variables represent named tokens that are accessible to their scope.
 *  They may either point to a string or, once resolved, a Group/Node.
 *  Not all variables can be resolved
 */
export enum VariableType {
  OBJECT_INSTANTIATION = "object_instantiation",
  CALL_EXPRESSION = "call_expression",
  NAMED_IMPORT = "named_import",
  NAMESPACE_IMPORT = "namespace_import",
  INJECTION = "injection",
}

export class Variable {
  token: string;
  pointsTo: string | Call | Node | Group | null;
  startPosition: Point;
  endPosition: Point;
  variableType: VariableType;

  constructor({
    token,
    pointsTo = null,
    startPosition,
    endPosition,
    variableType,
  }: {
    token: string;
    pointsTo: string | Call | Node | Group | null;
    startPosition: Point;
    endPosition: Point;
    variableType: VariableType;
  }) {
    this.token = token;
    this.pointsTo = pointsTo;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.variableType = variableType;
  }

  toString(): string {
    return `Variable: token=${this.token}, pointsTo=${
      this.pointsTo?.toString() ?? null
    }`;
  }
}

/**
 *  Calls represent function call expressions.
 *  They can be an attribute call like object.do_something()
 *  Or a "naked" call like do_something()
 */
export class Call {
  token: string;
  startPosition: Point;
  endPosition: Point;
  ownerToken: string | null;
  text: string;

  constructor({
    token,
    startPosition,
    endPosition,
    ownerToken = null,
    text = "",
  }: {
    token: string;
    startPosition: Point;
    endPosition: Point;
    ownerToken?: string | null;
    text: string;
  }) {
    this.token = token;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.ownerToken = ownerToken;
    this.text = text;
  }

  /**
   * Attribute calls are like `a.do_something()` rather than `do_something()`
   */
  isAttribute(): boolean {
    return this.ownerToken !== null;
  }

  matchesVariable(variable: Variable) {
    if (!this.isAttribute()) {
      return null;
    }

    if (this.ownerToken === variable.token) {
    }
  }

  toString(): string {
    return `Call: token=${this.token}, ownerToken=${this.ownerToken}`;
  }
}

/**
 * Represent functions and class attributes
 */
export class Node {
  token: string | null;
  calls: Call[];
  variables: Variable[];
  startPosition: Point;
  endPosition: Point;
  parent: Node | Group;
  nodeType: NodeType;
  functionCalls: Call[];

  constructor({
    token,
    calls,
    variables,
    startPosition,
    endPosition,
    parent,
    nodeType,
    functionCalls = [],
  }: {
    token: string | null;
    calls: Call[];
    variables: Variable[];
    startPosition: Point;
    endPosition: Point;
    parent: Node | Group;
    nodeType: NodeType;
    functionCalls?: Call[];
  }) {
    this.token = token;
    this.calls = calls;
    this.variables = variables;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.parent = parent;
    this.nodeType = nodeType;
    this.functionCalls = functionCalls;
  }

  private resolveNamedImports(variableA: Variable, subgroup: Group) {
    /**
     * Resolve variables from named import statements
     * e.g. import { ArticleService } from './article.service';
     * Variable(token=ArticleService, pointsTo=/User/samples/nestjs-real-example-app/src/article/ArticleService.ts)
     * Group(token=ArticleService)
     * pointsTo should resolve from a filepath to the actual class Group
     */
    if (
      variableA.variableType === VariableType.NAMED_IMPORT &&
      subgroup.groupType === GroupType.CLASS &&
      variableA.pointsTo === subgroup.filePath
    ) {
      variableA.pointsTo = subgroup;
      return true;
    }
  }

  private resolveNamespaceImports(variableA: Variable, subgroup: Group) {
    /**
     * Resolve variables from namespace import statements
     * e.g. import * as utils from '../lib/utils'
     * Variable(token=utils, pointsTo=/User/samples/xxx/lib/utils.ts)
     * Group(token=utils.ts)
     * pointsTo should resolve from a filepath to the actual file Group
     */
    if (
      variableA.variableType === VariableType.NAMESPACE_IMPORT &&
      subgroup.groupType === GroupType.FILE &&
      variableA.pointsTo === subgroup.filePath
    ) {
      variableA.pointsTo = subgroup;
      return true;
    }
  }

  private resolveRelativeImport(variableA: Variable, allSubgroups: Group[]) {
    for (const subgroup of allSubgroups) {
      if (this.resolveNamedImports(variableA, subgroup)) {
        return true;
      }

      if (this.resolveNamespaceImports(variableA, subgroup)) {
        return true;
      }

      /**
       * Resolve variables from relative import statements
       * e.g. import { CreateArticleDto, CreateCommentDto } from './dto';
       * Variable(token=CreateArticleDto, pointsTo=/User/samples/nestjs-real-example-app/src/article/dto)
       * pointsTo should resolve from a filepath to the actual class Group
       */
      if (
        variableA.variableType === VariableType.NAMED_IMPORT &&
        variableA.pointsTo &&
        typeof variableA.pointsTo === "string" &&
        path.isAbsolute(variableA.pointsTo) &&
        fs.existsSync(variableA.pointsTo) &&
        fs.statSync(variableA.pointsTo).isDirectory()
      ) {
        const baseDirectory = path.dirname(subgroup.filePath);
        if (
          variableA.pointsTo === baseDirectory &&
          subgroup.token === variableA.token
        ) {
          variableA.pointsTo = subgroup;
          return subgroup;
        }
      }

      /**
       * resolve NestJS / Java constructor injection from the variable name to class
       * e.g. variable: articleService => class ArticleService
       * findLinkForCall will resolve articleService.findAll to ArticleService.findAll
       */
      if (
        variableA.variableType === VariableType.INJECTION &&
        variableA.pointsTo === subgroup.token
      ) {
        variableA.pointsTo = subgroup;
        return subgroup;
      }
    }
    return null;
  }

  private resolveGlobalNodeImport(
    variableA: Variable,
    allNodes: Node[],
    fileGroup: Group | null
  ) {
    /**
     * For the corresponding global node of the file, search for the imported class
     * example:
     *  Group(article.service.ts), Node(token=(global), variables=[Variable(token=Comment, pointsTo=Group(token=Comment))]
     *  Group=(ArticleService), Node=(token=addComment, variables=[Variable(token=comment, pointsTo=Comment, type="object_instantiation")])
     */
    const globalNode = allNodes.find(
      (node) =>
        node.token === GLOBAL &&
        node.getFileGroup()?.filePath === fileGroup?.filePath
    );

    if (
      variableA.variableType === VariableType.OBJECT_INSTANTIATION &&
      globalNode
    ) {
      for (const variable of globalNode.variables) {
        if (
          variable.variableType === VariableType.NAMED_IMPORT &&
          variable.token === variableA.pointsTo
        ) {
          variableA.pointsTo = variable.pointsTo;
          return variable.pointsTo;
        }
      }
    }
  }

  private resolveNodeReference(variableA: Variable, allNodes: Node[]) {
    for (const node of allNodes) {
      if (variableA.pointsTo === node.token) {
        variableA.pointsTo = node;
        return node;
      }
    }
  }

  /**
   * Resolve the Node/Group for the pointsTo field
   */
  resolveVariables(allSubgroups: Group[], allNodes: Node[]): void {
    const fileGroup = this.getFileGroup();
    for (const variableA of this.variables) {
      if (this.resolveRelativeImport(variableA, allSubgroups)) {
        return;
      }
      if (this.resolveGlobalNodeImport(variableA, allNodes, fileGroup)) {
        return;
      }
      if (this.resolveNodeReference(variableA, allNodes)) {
        return;
      }
    }
  }

  isConstructor(): boolean {
    return this.token === "constructor";
  }

  getFileGroup(): Group | null {
    let parent: Node | Group = this.parent;
    while (parent?.parent) {
      parent = parent.parent;
    }

    if (parent instanceof Group) {
      return parent;
    }

    return null;
  }

  /* 
  getVariablesInScope(): Variable[] {
    let ret: Variable[] = this.lineNumber
      ? this.variables.filter(
          (v) => v.lineNumber !== null && v.lineNumber <= this.lineNumber
        )
      : [...this.variables];

    let parent: Group | Node | null = this.parent;
    while (parent) {
      ret = ret.concat(parent.getVariablesInScope());
      parent = parent.parent;
    }
    return ret;
  } 
  */

  toString() {
    const callsStr = this.calls.map((call) => call.toString()).join(",\n\t");
    const variablesStr = this.variables
      .map((variable) => variable.toString())
      .join(",\n\t");
    const functionCallsStr = this.functionCalls
      .map((fnCall) => fnCall.toString())
      .join(",\n\t");

    return `Node(
      token=${this.token}, 
      calls=[
        ${callsStr}
      ], 
      variables=[
        ${variablesStr}
      ], 
      functionCalls=[
        ${functionCallsStr}
      ],
      parent=${this.parent?.token}
    )`;
  }
}

/**
 * Represent namespaces (classes and modules/files)
 */
export enum GroupType {
  CLASS = "class",
  FILE = "file",
  INTERFACE = "interface",
  STRUCT = "struct",
  NAMESPACE = "namespace",
  RECORD = "record",
}

export class Group {
  nodes: Node[];
  subgroups: Group[];
  groupType: GroupType;
  token: string | null;
  startPosition: Point;
  endPosition: Point;
  parent: Group | null;
  rootNode: Node | null;
  filePath: string;

  constructor({
    groupType,
    token,
    startPosition,
    endPosition,
    parent = null,
    filePath,
  }: {
    groupType: GroupType;
    token: string | null;
    startPosition: Point;
    endPosition: Point;
    parent?: Group | null;
    filePath: string;
  }) {
    this.nodes = [];
    this.subgroups = [];
    this.groupType = groupType;
    this.token = token;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.parent = parent;
    this.rootNode = null;
    this.filePath = filePath;
  }

  getFileGroup(): Group {
    let parent: Group = this;
    while (parent?.parent) {
      parent = parent.parent;
    }
    return parent;
  }

  addNode(node: Node, isRoot = false): void {
    this.nodes.push(node);
    if (isRoot) {
      this.rootNode = node;
    }
  }

  addSubgroup(group: Group): void {
    this.subgroups.push(group);
  }

  /**
   * List of group + all subgroups
   * @returns {Array} List of groups
   */
  allGroups(): Group[] {
    return [this, ...this.subgroups.flatMap((sg) => sg.allGroups())];
  }

  /**
   * List of nodes that are part of this group + all subgroups
   * @returns {Array} List of nodes
   */
  allNodes(): Node[] {
    return [...this.nodes, ...this.subgroups.flatMap((sg) => sg.allNodes())];
  }

  toString(): string {
    return `Group: token=${this.token}`;
  }
}

export class Edge {
  source: Node | Group;
  target: Node | Group;
  constructor(source: Node | Group, target: Node | Group) {
    this.source = source;
    this.target = target;
  }
}
