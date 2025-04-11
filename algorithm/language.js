import {
  Node,
  Group,
  Variable,
  VariableType,
} from "./model.js";
import {
  makeCalls,
  makeLocalVariables,
  getName,
  getAllChildrenOfType,
  processConstructorRequiredParameter,
} from "./function.js";
import { RuleEngine } from "./rules.js";

export const GLOBAL = "(global)";

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
  static separateNamespaces(node, languageRules) {
    const groups = [];
    const nodes = [];
    const body = [];

    for (const child of node.children) {
      const nodeType = RuleEngine.matchNodeRules(child, languageRules.nodes);
      if (nodeType) {
        child.nodeType = nodeType;
        nodes.push(child);
        continue;
      }

      const groupType = RuleEngine.matchGroupRules(child, languageRules.groups);
      if (groupType) {
        child.groupType = groupType;
        groups.push(child);
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
  static makeClassGroup(tree, parent, languageRules) {
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

  /**
   * Given an AST of all the lines in a function, create the Node along with the
   * calls and variables internal to it. Also make the nested subnodes
   */
  static makeNodes(tree, parent, languageRules) {
    const { nodes, body } = this.separateNamespaces(tree, languageRules);
    const token = getName(tree, languageRules.getName);
    if (!token) {
      return [];
    }
    const calls = makeCalls(body, languageRules.getName);
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

    /**
     * For Java, convert class attributes (field_declarations) to variables.
     * e.g.  private VenueService service;
     * Variable(token=service, pointsTo=VenueService)
     * Since VenueService is a string, we need to resolve it to the actual Class node later.
     */
    if (tree.type === "field_declaration") {
      const typeIdentifier = tree.childForFieldName("type");
      const variableDeclarator = tree.childForFieldName("declarator");
      const identifier = variableDeclarator?.childForFieldName("name");
      if (identifier && typeIdentifier) {
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
    }

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

  static makeRootNode(body, parent, languageRules) {
    return new Node({
      token: GLOBAL,
      calls: makeCalls(body, languageRules.getName),
      variables: makeLocalVariables(body, parent, languageRules),
      startPosition: { row: 0, column: 0 },
      parent,
    });
  }
}
