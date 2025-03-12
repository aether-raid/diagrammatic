import * as vscode from "vscode";

// configName should be from the GLOBALS file
export const retrieveExtensionConfig = (configName: string) => {
  const config = vscode.workspace.getConfiguration();
  return config.get<string>(configName);
};
