import { GLOBALS } from "../globals";
import { GeminiProvider } from "../llm/geminiProvider";
import { OpenAIProvider } from "../llm/openAiProvider";
import { AzureOpenAIProvider } from "../llm/azureOpenAiProvider";
import { retrieveExtensionConfig } from "./common";
import { retrieveUriParameters } from "./uriParameters";

export interface LLMProvider {
  generateResponse(systemPrompt:string, userPrompt: string): Promise<any>;
}

const retrieveLLMProviderConfig = () => {
  return retrieveExtensionConfig(GLOBALS.llmProvider.configName);
}

export const retrieveLLMProvider = (apiKey: string) => {
  const llmProviderName = retrieveLLMProviderConfig();

  let llmProvider: LLMProvider;
  switch (llmProviderName) {
    case "openai":
      llmProvider = new OpenAIProvider(apiKey);
      break;
    case "gemini":
      llmProvider = new GeminiProvider(apiKey);
      break;
    case "azure-openai":
      const { endpoint, deployment, apiVersion } = retrieveUriParameters();
      llmProvider = new AzureOpenAIProvider(apiKey, endpoint, deployment, apiVersion);
      break;
    default:
      throw new Error("No LLM provider selected.")
  }

  return llmProvider;
}
