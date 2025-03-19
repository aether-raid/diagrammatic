import { LLMProvider } from "../helpers/llm";
import { AzureOpenAI } from "openai";

export class AzureOpenAIProvider implements LLMProvider {
    private readonly apiKey: string;
    private readonly endpoint: string;
    private readonly deploymentId: string;
    private readonly modelName: string;
    private readonly apiVersion: string

    constructor(apiKey: string, endpoint: string, modelName: string, deploymentId: string, apiVersion: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.deploymentId = deploymentId;
        this.modelName = modelName;
        this.apiVersion = apiVersion;
    }

    async generateResponse(systemPrompt: string, userPrompt: string): Promise<string> {
        const endpoint = this.endpoint;
        const apiKey = this.apiKey;
        const apiVersion = this.apiVersion;
        const deploymentId = this.deploymentId;
        const modelName = this.modelName;
        const options = { endpoint, apiKey, deploymentId, apiVersion }
        const client = new AzureOpenAI(options);
        try {
            const response = await client.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0,
                model: modelName
            });

            return response.choices[0].message.content ?? "";

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            throw new Error("Failed to generate response from Azure OpenAI.");
        }

    }
}