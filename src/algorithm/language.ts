import { Node, Group, GroupType } from "./model.js";
import {
  makeCalls,
  makeLocalVariables,
  getName,
  getLineNumber,
  getAllChildrenOfType,
  processConstructorRequiredParameter,
} from "./function.js";
import { SyntaxNode } from "tree-sitter";
import { LanguageRules, RuleEngine } from "./rules.js";

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
    groups: SyntaxNode[];
    nodes: SyntaxNode[];
    body: SyntaxNode[];
  } {
    const groups: SyntaxNode[] = [];
    const nodes: SyntaxNode[] = [];
    const body: SyntaxNode[] = [];

    for (const child of node.children) {
      if (RuleEngine.processNode(child, languageRules.nodes)) {
        nodes.push(child);
      } else if (RuleEngine.processNode(child, languageRules.groups)) {
        groups.push(child);
      } else {
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
    }

    return { groups, nodes, body };
  }

  /**
   * Given an AST for the subgroup (a class), generate that subgroup.
   * Generate all of the nodes internal to the group.
   */
  static makeClassGroup(
    tree: SyntaxNode,
    parent: Group,
    languageRules: LanguageRules
  ) {
    const {
      groups,
      nodes: nodeTrees,
      body,
    } = this.separateNamespaces(tree, languageRules);
    const matchingGroupRule = languageRules.groups.find(
      (group) => group.type === tree.type
    );
    if (!matchingGroupRule || !matchingGroupRule.groupType) {
      throw new Error("Group rule is missing groupType or does not exist!");
    }
    const classGroup = new Group({
      groupType: matchingGroupRule.groupType,
      token: getName(tree, languageRules.getName),
      lineNumber: getLineNumber(tree),
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

  /**
   * Given an AST of all the lines in a function, create the Node along with the
   * calls and variables internal to it. Also make the nested subnodes
   */
  static makeNodes(
    tree: SyntaxNode,
    parent: Node | Group,
    languageRules: LanguageRules
  ): Node[] {
    const { nodes, body } = this.separateNamespaces(tree, languageRules);
    const token = getName(tree, languageRules.getName);
    const calls = makeCalls(body);
    const variables = makeLocalVariables(body, parent, languageRules);

    /**
     * For NestJS, convert constructor arguments to variables.
     * e.g. constructor(private readonly articleService: ArticleService) {}
     * Variable(token=articleService, pointsTo=ArticleService)
     * Since ArticleService is a string, we need to resolve it to the actual Class node later.
     */
    if (token === "constructor") {
      const parameters = tree.childForFieldName("parameters");
      if (parameters) {
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
    }
    const node = new Node({
      token,
      calls,
      variables,
      lineNumber: getLineNumber(tree),
      parent,
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
      token: "(global)",
      calls: makeCalls(body),
      variables: makeLocalVariables(body, parent, languageRules),
      lineNumber: 0,
      parent,
    });
  }
}
