import path from "path";
import fs from "fs";
import { GLOBAL } from "./language.js";

/**
 *  Variables represent named tokens that are accessible to their scope.
 *  They may either point to a string or, once resolved, a Group/Node.
 *  Not all variables can be resolved
 */
export const VariableType = {
  OBJECT_INSTANTIATION: "object_instantiation",
  CALL_EXPRESSION: "call_expression",
  RELATIVE_IMPORT: "relative_import",
  INJECTION: "injection",
};

export class Variable {
  constructor({
    token,
    pointsTo,
    startPosition = {},
    endPosition = {},
    variableType,
  }) {
    this.token = token;
    this.pointsTo = pointsTo;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.variableType = variableType;
  }

  toString() {
    return `Variable: token=${this.token}, pointsTo=${
      this.pointsTo?.toString() ?? null
    }, type=${this.variableType}`;
  }
}

/**
 *  Calls represent function call expressions.
 *  They can be an attribute call like object.do_something()
 *  Or a "naked" call like do_something()
 */
export class Call {
  constructor({
    token,
    startPosition = {},
    endPosition = {},
    ownerToken = null,
  }) {
    this.token = token;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.ownerToken = ownerToken;
  }

  /**
   * Attribute calls are like `a.do_something()` rather than `do_something()`
   */
  isAttribute() {
    return this.ownerToken !== null;
  }

  matchesVariable(variable) {
    if (!this.isAttribute()) {
      return null;
    }

    if (this.ownerToken === variable.token) {
    }
  }

  toString() {
    return `Call: token=${this.token}, ownerToken=${this.ownerToken}`;
  }
}

/**
 * Represent functions and class attributes
 */
export const NodeType = {
  FUNCTION: "function",
  ATTRIBUTE: "attribute",
};

export class Node {
  constructor({
    token,
    calls,
    variables,
    startPosition = {},
    endPosition = {},
    parent,
    nodeType,
  }) {
    this.token = token;
    this.calls = calls;
    this.variables = variables;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.parent = parent;
    this.nodeType = nodeType;
  }

  /**
   * Resolve the Node/Group for the pointsTo field
   */
  resolveVariables(allSubgroups, allNodes) {
    const fileGroup = this.getFileGroup();
    for (const variableA of this.variables) {
      if (typeof variableA.pointsTo === "string") {
        for (const subgroup of allSubgroups) {
          /**
           * Resolve variables from relative import statements
           * e.g. import { ArticleService } from './article.service';
           * Variable(token=ArticleService, pointsTo=/User/samples/nestjs-real-example-app/src/article/ArticleService.ts)
           * Group(token=ArticleService)
           * pointsTo should resolve from a filepath to the actual class Group
           */
          if (
            variableA.variableType === VariableType.RELATIVE_IMPORT &&
            subgroup.groupType === GroupType.CLASS &&
            variableA.pointsTo === subgroup.filePath
          ) {
            variableA.pointsTo = subgroup;
            break;
          }

          /**
           * Resolve variables from relative import statements
           * e.g. import { CreateArticleDto, CreateCommentDto } from './dto';
           * Variable(token=CreateArticleDto, pointsTo=/User/samples/nestjs-real-example-app/src/article/dto)
           * pointsTo should resolve from a filepath to the actual class Group
           */
          if (
            variableA.variableType === VariableType.RELATIVE_IMPORT &&
            variableA.pointsTo &&
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
              break;
            }
          }

          if (
            variableA.variableType === VariableType.INJECTION &&
            variableA.pointsTo === subgroup.token
          ) {
            variableA.pointsTo = subgroup;
            break;
          }
        }

        /**
         * For the corresponding global node of the file, search for the imported class
         * example:
         *  Group(article.service.ts), Node(token=(global), variables=[Variable(token=Comment, pointsTo=Group(token=Comment))]
         *  Group=(ArticleService), Node=(token=addComment, variables=[Variable(token=comment, pointsTo=Comment, type="object_instantiation")])
         */
        const globalNode = allNodes.find(
          (node) =>
            node.token === GLOBAL &&
            node.getFileGroup().filePath === fileGroup.filePath
        );
        if (
          variableA.variableType === VariableType.OBJECT_INSTANTIATION &&
          globalNode
        ) {
          for (const variable of globalNode.variables) {
            if (
              variable.variableType === VariableType.RELATIVE_IMPORT &&
              variableA.pointsTo === variable.token
            ) {
              variableA.pointsTo = variable.pointsTo;
              break;
            }
          }
        }

        for (const node of allNodes) {
          if (variableA.pointsTo === node.token) {
            variableA.pointsTo = node;
            break;
          }
        }
      }
    }
  }

  isConstructor() {
    return this.token === "constructor";
  }

  getFileGroup() {
    let parent = this.parent;
    while (parent?.parent) {
      parent = parent.parent;
    }
    return parent;
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

    return `Node(
      token=${this.token}, 
      calls=[
        ${callsStr}
      ], 
      variables=[
        ${variablesStr}
      ], 
      parent=${this.parent?.token}
    )`;
  }
}

/**
 * Represent namespaces (classes and modules/files)
 */
export const GroupType = {
  CLASS: "class",
  FILE: "file",
  INTERFACE: "interface",
  STRUCT: "struct",
  NAMESPACE: "namespace",
  RECORD: "record",
};

export class Group {
  constructor({
    groupType,
    token,
    startPosition = {},
    endPosition = {},
    parent = null,
    filePath,
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

  getFileGroup() {
    let parent = this;
    while (parent?.parent) {
      parent = parent.parent;
    }
    return parent;
  }

  addNode(node, isRoot = false) {
    this.nodes.push(node);
    if (isRoot) {
      this.rootNode = node;
    }
  }

  addSubgroup(group) {
    this.subgroups.push(group);
  }

  /**
   * List of group + all subgroups
   * @returns {Array} List of groups
   */
  allGroups() {
    return [this, ...this.subgroups.flatMap((sg) => sg.allGroups())];
  }

  /**
   * List of nodes that are part of this group + all subgroups
   * @returns {Array} List of nodes
   */
  allNodes() {
    return [...this.nodes, ...this.subgroups.flatMap((sg) => sg.allNodes())];
  }

  toString() {
    return `Group: token=${this.token}, groupType:${this.groupType}`;
  }
}

export class Edge {
  constructor(source, target) {
    this.source = source;
    this.target = target;
  }
}
