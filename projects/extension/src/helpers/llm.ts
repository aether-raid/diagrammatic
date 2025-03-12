import { GLOBALS } from "../globals";
import { retrieveExtensionConfig } from "./common";

export const retrieveLLMProviderConfig = () => {
  return retrieveExtensionConfig(GLOBALS.llmProvider.configName);
}