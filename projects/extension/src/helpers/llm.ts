import { GLOBALS } from "../globals";
import { retrieveExtensionConfig } from "./common";

export const retrieveLLMProviderConfig = () => {
  return retrieveExtensionConfig(GLOBALS.llmProvider.configName);
}

export interface LLMProvider {
  generateResponse(systemPrompt:string, userPrompt: string): Promise<any>;
}