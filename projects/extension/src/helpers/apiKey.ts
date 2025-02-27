import { GLOBALS } from "../globals"
import { retrieveExtensionConfig } from "./common"

export const retrieveOpenAiApiKey = () => {
  return retrieveExtensionConfig(GLOBALS.openAiApiKey.configName);
}
