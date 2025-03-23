import { GLOBALS } from "../globals";
import { retrieveExtensionConfig } from "./common";

export const retrieveUriParameters = () => {
    return {
      endpoint: retrieveExtensionConfig(GLOBALS.azureOpenAI.endpoint.configName) || "",
      deployment: retrieveExtensionConfig(GLOBALS.azureOpenAI.deployment.configName) || "",
      apiVersion: retrieveExtensionConfig(GLOBALS.azureOpenAI.apiVersion.configName) || "",
    };
  };