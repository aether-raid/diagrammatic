import { GLOBALS } from "../globals";
import { retrieveExtensionConfig } from "./common";

export const retrieveUriParameters = () => {
    return {
      endpoint: retrieveExtensionConfig(GLOBALS.azureOpenAI.endpoint.configName) || "",
      model: retrieveExtensionConfig(GLOBALS.azureOpenAI.model.configName) || "",
      deploymentId: retrieveExtensionConfig(GLOBALS.azureOpenAI.deploymentId.configName) || "",
      apiVersion: retrieveExtensionConfig(GLOBALS.azureOpenAI.apiVersion.configName) || "",
    };
  };