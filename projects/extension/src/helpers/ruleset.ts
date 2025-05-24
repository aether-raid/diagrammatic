import * as vscode from "vscode";
import { existsSync } from "fs";

import { RuleEngine } from "../codeToDiagram/algorithm/rules";
import { GLOBALS } from "../globals";
import { retrieveExtensionConfig } from "./common";
import * as path from "path";

const getDefaultRulesetPath = () => {
  const extension = vscode.extensions.getExtension(
    "diagrammatic.diagrammatic"
  )!;
  // const rulesPath = `${extension.extensionPath}\\config\\default-rules.json`;
  const rulesPath = path.join(extension.extensionPath, 'config', 'default-rules.json');

  if (!rulesPath || !existsSync(rulesPath)) {
    return;
  }
  return rulesPath;
};

export const retrieveRuleset = () => {
  let rulesetPath = retrieveExtensionConfig(GLOBALS.ruleset.configName);
  if (!rulesetPath || !existsSync(rulesetPath)) {
    vscode.window.showInformationMessage(
      `No ruleset file was found at '${rulesetPath}'. Using default rules.`
    );
    rulesetPath = getDefaultRulesetPath();
    if (!rulesetPath) {
      // Oh no, someone messed with default-rules.json :(
      return;
    }
  }

  return RuleEngine.loadRules(rulesetPath);
};