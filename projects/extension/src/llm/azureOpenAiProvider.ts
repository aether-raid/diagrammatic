import { LLMProvider } from "../helpers/llm";
import axios from "axios";

export class AzureOpenAIProvider implements LLMProvider{
    private readonly apiKey: string;
    private readonly endpoint: string;
    private readonly deploymentId: string;
    private readonly apiVersion: string

    constructor(apiKey: string, endpoint: string, deploymentId: string, apiVersion: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.deploymentId = deploymentId;
        this.apiVersion = apiVersion;
    }

    async generateResponse(systemPrompt: string, userPrompt: string): Promise<string> {
        try {
          const response = await axios.post(
            `${this.endpoint}/openai/deployments/${this.deploymentId}/completions?api-version=${this.apiVersion}-preview`,
            {
              prompt: [userPrompt],
              temperature: 0,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "api-key": this.apiKey,
              },
            }
          );
    
          return response.data.choices[0].message.content;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            throw new Error("Failed to generate response from Azure OpenAI.");
          }

    }
}