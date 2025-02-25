import * as vscode from "vscode";
import { existsSync } from "fs";

import { RuleEngine } from "../algorithm/rules";
import { GLOBALS } from "../globals";

const getDefaultRulesetPath = () => {
  const extension = vscode.extensions.getExtension(
    "diagrammatic.diagrammatic"
  )!;
  const path = `${extension.extensionPath}\\config\\default-rules.json`;

  if (!path || !existsSync(path)) return;
  return path;
};

export const retrieveRuleset = () => {
  const config = vscode.workspace.getConfiguration();

  let rulesetPath = config.get<string>(GLOBALS.ruleset.configName);

  if (!rulesetPath || !existsSync(rulesetPath)) {
    vscode.window.showInformationMessage(
      `No ruleset file was found at '${rulesetPath}'. Using default rules.`
    );
    rulesetPath = getDefaultRulesetPath();
    if (!rulesetPath) return; // Oh no, someone messed with default-rules.json :(
  }

  return RuleEngine.loadRules(rulesetPath);
};
