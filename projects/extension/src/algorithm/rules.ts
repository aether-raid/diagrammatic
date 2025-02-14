import { getFirstChildOfType } from "./function";
import fs from "fs";
import { SyntaxNode } from "tree-sitter";
import { GroupType } from "./model";

export type Rule = {
  type?: string;
  field?: string;
  child?: Rule;
};

export type GroupRule = Rule & {
  groupType: GroupType;
};

export type NodeConfig = {
  childType?: string;
  delegate?: boolean;
  fieldName?: string;
  useText?: boolean;
};

export type getNameConfig = {
  fallbackFields: string[];
} & Record<string, NodeConfig>;

export type LanguageRules = {
  nodes: Rule[];
  groups: GroupRule[];
  getName: getNameConfig;
};

export class RuleEngine {
  static loadRules(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  /**
   * Matches a syntax tree node against a given rule.
   *
   * This function is used to determine whether a specific node in the syntax tree
   * satisfies the conditions defined in a rule. A rule specifies a `type` to match
   * against the node and may include additional nested conditions for child nodes.
   *
   * @param {Node} node - The syntax tree node to be matched. This is typically
   *                        an object provided by the parser (e.g., Tree-Sitter).
   * @param {object} rule - The rule to match against. A rule contains:
   *                        - `type`: The type of the node to match (e.g., "function_declaration").
   *                        - `child` (optional): A nested rule for a specific child node,
   *                          which may include:
   *                          - `field`: The field name to access the child node (e.g., "arguments").
   *                          - `type`: The type of the child node to match.
   *
   * @returns {boolean} - Returns `true` if the node matches the rule and its child
   *                      conditions (if any). Returns `false` otherwise.
   *
   * Example Rule:
   * const rule = {
   *   type: "call_expression",
   *   child: {
   *     field: "arguments",
   *     child: {
   *      type: "arrow_function"
   *     }
   *   }
   * };
   */
  static matchNode(node: SyntaxNode, rule: Rule) {
    // Match the node type
    if (node.type !== rule.type) {
      return false;
    }

    // Recursively check for child rules
    if (rule.child) {
      const field = rule.child.field || null;
      const type = rule.child.type || null;

      const childNode = field
        ? node.childForFieldName(field)
        : type
        ? getFirstChildOfType(node, type)
        : null;

      if (!childNode || !this.matchNode(childNode, rule.child)) {
        return false;
      }
    }

    return true;
  }

  static processNode(node: SyntaxNode, rules: Rule[]) {
    for (const rule of rules) {
      if (this.matchNode(node, rule)) {
        return true; // Node matches the rule
      }
    }
    return false;
  }
}
