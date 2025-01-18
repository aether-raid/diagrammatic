import { Node, Group, GroupType } from "./model.js";
import {
  makeCalls,
  makeLocalVariables,
  getName,
  getLineNumber,
  getAllChildrenOfType,
  processConstructorRequiredParameter,
  getFirstChildOfType,
} from "./function.js";
import { visualizeAST } from "./temp.js";

export class TypeScriptAlgorithm {
  /**
   * Recursively separates a Tree-sitter syntax tree node into groups, nodes, and body.
   * Group: FILE / CLASS
   * Node: METHOD / FUNCTION
   * Body: EVERYTHING ELSE
   *
   * @param node - Tree-sitter node.
   * @returns - {groups, nodes, body}
   */
  static separateNamespaces(node) {
    const groups = [];
    const nodes = [];
    const body = [];

    for (const child of node.children) {
      const nodeType = child.type;

      if (
        (nodeType === "call_expression" &&
          getFirstChildOfType(
            child.childForFieldName("arguments"),
            "arrow_function"
          )) ||
        (nodeType === "export_statement" &&
          getFirstChildOfType(child, "lexical_declaration")) ||
        nodeType === "method_definition" ||
        nodeType === "function_declaration"
      ) {
        nodes.push(child);
      } else if (nodeType === "class_declaration") {
        groups.push(child);
      } else {
        const {
          groups: subGroups,
          nodes: subNodes,
          body: subBody,
        } = this.separateNamespaces(child);

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
  static makeClassGroup(node, parent) {
    const { groups, nodes: nodeTrees, body } = this.separateNamespaces(node);
    const classGroup = new Group({
      groupType: GroupType.CLASS,
      token: getName(node),
      lineNumber: getLineNumber(node),
      parent,
    });

    for (const node of nodeTrees) {
      const nodeList = this.makeNodes(node, classGroup);
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
  static makeNodes(tree, parent) {
    const { nodes, body } = this.separateNamespaces(tree);
    const token = getName(tree);
    const calls = makeCalls(body);
    const variables = makeLocalVariables(body, parent);

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
    const subnodes = nodes.flatMap((t) => this.makeNodes(t, node));
    return [node, ...subnodes];
  }

  static makeRootNode(body, parent) {
    return new Node({
      token: "(global)",
      calls: makeCalls(body),
      variables: makeLocalVariables(body, parent),
      lineNumber: 0,
      parent,
    });
  }
}
