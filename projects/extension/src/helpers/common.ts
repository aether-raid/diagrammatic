import * as vscode from "vscode";

import { GLOBALS } from "../globals";

// configName should be from the GLOBALS file
export const retrieveExtensionConfig = (configName: string) => {
  const config = vscode.workspace.getConfiguration();
  return config.get<string>(configName);
}
