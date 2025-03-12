import { GLOBALS } from "../globals";
import { retrieveExtensionConfig } from "./common";

export const retrieveOpenAiApiKey = ():string => {
  return retrieveExtensionConfig(GLOBALS.openAiApiKey.configName) || "";
};
