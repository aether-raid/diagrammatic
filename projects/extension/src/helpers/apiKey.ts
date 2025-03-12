import { GLOBALS } from "../globals";
import { retrieveExtensionConfig } from "./common";

export const retrieveApiKey = ():string => {
  return retrieveExtensionConfig(GLOBALS.apiKey.configName) || "";
};
