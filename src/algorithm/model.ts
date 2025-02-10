/**
 *  Variables represent named tokens that are accessible to their scope.
 *  They may either point to a string or, once resolved, a Group/Node.
 *  Not all variables can be resolved
 */
export class Variable {
  token: string;
  pointsTo: string | Call | Node | Group | null;
  lineNumber: number | null;

  constructor(
    token: string,
    pointsTo: string | Call | Node | Group | null = null,
    lineNumber: number | null = null
  ) {
    this.token = token;
    this.pointsTo = pointsTo;
    this.lineNumber = lineNumber;
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
  lineNumber: number | null;
  ownerToken: string | null;

  constructor({
    token,
    lineNumber = null,
    ownerToken = null,
  }: {
    token: string;
    lineNumber?: number | null;
    ownerToken?: string | null;
  }) {
    this.token = token;
    this.lineNumber = lineNumber;
    this.ownerToken = ownerToken;
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

export class Node {
  token: string | null;
  calls: Call[];
  variables: Variable[];
  lineNumber: number | null;
  parent: Node | Group;

  constructor({
    token,
    calls,
    variables,
    lineNumber = null,
    parent,
  }: {
    token: string | null;
    calls: Call[];
    variables: Variable[];
    lineNumber?: number | null;
    parent: Node | Group;
  }) {
    this.token = token;
    this.calls = calls;
    this.variables = variables;
    this.lineNumber = lineNumber;
    this.parent = parent;
  }

  /**
   * Resolve the Node/Group for the pointsTo field
   */
  resolveVariables(allSubgroups: Group[], allNodes: Node[]): void {
    for (const variable of this.variables) {
      if (typeof variable.pointsTo === "string") {
        for (const subgroup of allSubgroups) {
          if (variable.pointsTo === subgroup.token) {
            variable.pointsTo = subgroup;
          }

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

  isConstructor(): boolean {
    return this.token === "constructor";
  }

  getFileGroup(): Group | Node {
    let parent: Group | Node = this.parent;
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
export enum GroupType {
  CLASS = "class",
  FILE = "file",
  INTERFACE = "interface",
  STRUCT = 'struct',
  NAMESPACE = "namespace",
}

export class Group {
  nodes: Node[];
  subgroups: Group[];
  groupType: GroupType;
  token: string | null;
  lineNumber: number | null;
  parent: Group | null;
  rootNode: Node | null;
  filePath: string;

  constructor({
    groupType,
    token,
    lineNumber = null,
    parent = null,
    filePath,
  }: {
    groupType: GroupType;
    token: string | null;
    lineNumber?: number | null;
    parent?: Group | null;
    filePath: string;
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
