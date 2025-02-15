/**
 *  Variables represent named tokens that are accessible to their scope.
 *  They may either point to a string or, once resolved, a Group/Node.
 *  Not all variables can be resolved
 */
export class Variable {
  constructor(token, pointsTo, lineNumber) {
    this.token = token;
    this.pointsTo = pointsTo;
    this.lineNumber = lineNumber;
  }

  toString() {
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
  constructor({ token, lineNumber = null, ownerToken = null }) {
    this.token = token;
    this.lineNumber = lineNumber;
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
    lineNumber = null,
    parent,
    nodeType,
  }) {
    this.token = token;
    this.calls = calls;
    this.variables = variables;
    this.lineNumber = lineNumber;
    this.parent = parent;
    this.nodeType = nodeType;
  }

  /**
   * Resolve the Node/Group for the pointsTo field
   */
  resolveVariables(allSubgroups, allNodes) {
    for (const variable of this.variables) {
      if (typeof variable.pointsTo === "string") {
        for (const subgroup of allSubgroups) {
          if (variable.pointsTo === subgroup.token) {
            variable.pointsTo = subgroup;
          }

          /**
           * Resolve variables from relative import statements
           * e.g. import { SyntaxNode } from 'tree-sitter'
           * Variable(token=SyntaxNode, pointsTo=/User/samples/nestjs-real-example-app/src/article/ArticleService.ts)
           * pointsTo should resolve from a filepath to the actual file Group
           */
          if (
            subgroup.groupType === GroupType.FILE &&
            variable.pointsTo === subgroup.filePath
          ) {
            variable.pointsTo = subgroup;
          }
        }

        for (const node of allNodes) {
          if (variable.pointsTo === node.token) {
            variable.pointsTo = node;
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
    lineNumber = null,
    parent = null,
    filePath,
  }) {
    this.nodes = [];
    this.subgroups = [];
    this.groupType = groupType;
    this.token = token;
    this.lineNumber = lineNumber;
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
    return `Group: token=${this.token}`;
  }
}

export class Edge {
  constructor(source, target) {
    this.source = source;
    this.target = target;
  }
}
