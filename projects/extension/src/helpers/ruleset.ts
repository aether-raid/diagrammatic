import * as vscode from "vscode";
import { existsSync } from "fs";

import { RuleEngine } from "../algorithm/rules";
import { GLOBALS } from "../globals";
import { retrieveExtensionConfig } from "./common";

const getDefaultRulesetPath = () => {
  const extension = vscode.extensions.getExtension(
    "diagrammatic.diagrammatic"
  )!;
  const path = `${extension.extensionPath}\\config\\default-rules.json`;

  if (!path || !existsSync(path)) {
    return;
  }
  return path;
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
