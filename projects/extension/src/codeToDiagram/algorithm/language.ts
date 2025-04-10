import { Node, Group, Variable, VariableType, GroupType } from "./model";
import { NodeType } from "@shared/node.types";
import {
  makeCalls,
  makeLocalVariables,
  getName,
  getAllChildrenOfType,
  processConstructorRequiredParameter,
} from "./function";
import { SyntaxNode } from "tree-sitter";
import { LanguageRules, RuleEngine } from "./rules";

export const GLOBAL = "(global)";

interface NodeSyntaxNode extends SyntaxNode {
  nodeType: NodeType
}

interface GroupSyntaxNode extends SyntaxNode {
  groupType: GroupType
}

export class Language {
  /**
   * Recursively separates a Tree-sitter syntax tree node into groups, nodes, and body.
   * Group: FILE / CLASS
   * Node: METHOD / FUNCTION
   * Body: EVERYTHING ELSE
   *
   * @param node - Tree-sitter node.
   * @returns - {groups, nodes, body}
   */
  static separateNamespaces(
    node: SyntaxNode,
    languageRules: LanguageRules
  ): {
    groups: GroupSyntaxNode[];
    nodes: NodeSyntaxNode[];
    body: SyntaxNode[];
  } {
    const groups: GroupSyntaxNode[] = [];
    const nodes: NodeSyntaxNode[] = [];
    const body: SyntaxNode[] = [];

    for (const child of node.children) {
      const nodeType = RuleEngine.matchNodeRules(child, languageRules.nodes);
      if (nodeType) {
        (child as NodeSyntaxNode).nodeType = nodeType;
        nodes.push(child as NodeSyntaxNode);
        continue;
      }

      const groupType = RuleEngine.matchGroupRules(child, languageRules.groups);
      if (groupType) {
        (child as GroupSyntaxNode).groupType = groupType;
        groups.push(child as GroupSyntaxNode);
        continue;
      }

      const {
        groups: subGroups,
        nodes: subNodes,
        body: subBody,
      } = this.separateNamespaces(child, languageRules);

      if (subGroups.length > 0 || subNodes.length > 0) {
        groups.push(...subGroups);
        nodes.push(...subNodes);
        body.push(...subBody);
      } else {
        body.push(child);
      }
    }

    return { groups, nodes, body };
  }

  /**
   * Given an AST for the subgroup (a class), generate that subgroup.
   * Generate all of the nodes internal to the group.
   */
  static makeClassGroup(
    tree: GroupSyntaxNode,
    parent: Group,
    languageRules: LanguageRules
  ) {
    const { nodes: nodeTrees } = this.separateNamespaces(tree, languageRules);

    const classGroup = new Group({
      groupType: tree.groupType,
      token: getName(tree, languageRules.getName),
      startPosition: tree.startPosition,
      endPosition: tree.endPosition,
      parent,
      filePath: parent.filePath,
    });

    for (const node of nodeTrees) {
      const nodeList = this.makeNodes(node, classGroup, languageRules);
      for (const subnode of nodeList) {
        classGroup.addNode(subnode);
      }
    }
    return classGroup;
  }

  private static processConstructorInjection(
    tree: SyntaxNode,
    token: string,
    variables: Variable[]
  ) {
    if (token !== "constructor") {
      return;
    }
    /**
     * For NestJS, convert constructor arguments to variables.
     * e.g. constructor(private readonly articleService: ArticleService) {}
     * Variable(token=articleService, pointsTo=ArticleService)
     * Since ArticleService is a string, we need to resolve it to the actual Class node later.
     */

    const parameters = tree.childForFieldName("parameters");
    if (!parameters) {
      return;
    }

    const requiredParameters = getAllChildrenOfType(
      parameters,
      "required_parameter"
    );
    for (const parameter of requiredParameters) {
      if (parameter) {
        const dependencyInjection =
          processConstructorRequiredParameter(parameter);
        if (dependencyInjection) {
          variables.push(dependencyInjection);
        }
      }
    }
  }

  private static processFieldDeclaration(
    tree: SyntaxNode,
    variables: Variable[]
  ) {
    /**
     * For Java, convert class attributes (field_declarations) to variables.
     * e.g.  private VenueService service;
     * Variable(token=service, pointsTo=VenueService)
     * Since VenueService is a string, we need to resolve it to the actual Class node later.
     */
    if (tree.type !== "field_declaration") {
      return;
    }

    const typeIdentifier = tree.childForFieldName("type");
    const variableDeclarator = tree.childForFieldName("declarator");
    if (!variableDeclarator) {
      return;
    }

    const identifier = variableDeclarator.childForFieldName("name");
    if (!identifier || !typeIdentifier) {
      return;
    }

    variables.push(
      new Variable({
        token: identifier.text,
        pointsTo: typeIdentifier.text,
        startPosition: tree.startPosition,
        endPosition: tree.endPosition,
        variableType: VariableType.INJECTION,
      })
    );
  }

  /**
   * Given an AST of all the lines in a function, create the Node along with the
   * calls and variables internal to it. Also make the nested subnodes
   */
  static makeNodes(
    tree: NodeSyntaxNode,
    parent: Node | Group,
    languageRules: LanguageRules
  ): Node[] {
    const { nodes, body } = this.separateNamespaces(tree, languageRules);
    const token = getName(tree, languageRules.getName);
    if (!token) {
      return [];
    }
    const calls = makeCalls(body, languageRules.getName);
    const variables = makeLocalVariables(body, parent, languageRules);

    this.processConstructorInjection(tree, token, variables);
    this.processFieldDeclaration(tree, variables);

    const node = new Node({
      token,
      calls,
      variables,
      startPosition: tree.startPosition,
      endPosition: tree.endPosition,
      parent,
      nodeType: tree.nodeType,
    });
    const subnodes = nodes.flatMap((t) =>
      this.makeNodes(t, node, languageRules)
    );
    return [node, ...subnodes];
  }

  static makeRootNode(
    body: SyntaxNode[],
    parent: Group,
    languageRules: LanguageRules
  ): Node {
    return new Node({
      token: GLOBAL,
      calls: makeCalls(body, languageRules.getName),
      variables: makeLocalVariables(body, parent, languageRules),
      startPosition: body[0]?.startPosition ?? { row: 0, column: 0 },
      endPosition: body[body.length - 1]?.endPosition ?? { row: 0, column: 0 },
      parent,
      nodeType: NodeType.BODY,
    });
  }
}
