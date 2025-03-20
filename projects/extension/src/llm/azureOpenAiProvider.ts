import { LLMProvider } from "../helpers/llm";
import { AzureOpenAI } from "openai";

export class AzureOpenAIProvider implements LLMProvider {
    private readonly apiKey: string;
    private readonly endpoint: string;
    private readonly deployment: string;
    private readonly apiVersion: string

    constructor(apiKey: string, endpoint: string, deployment: string, apiVersion: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.deployment = deployment;
        this.apiVersion = apiVersion;
    }

    async generateResponse(systemPrompt: string, userPrompt: string): Promise<string> {
        const endpoint = this.endpoint;
        const apiKey = this.apiKey;
        const apiVersion = this.apiVersion;
        const deployment = this.deployment;
        const options = { endpoint, apiKey, apiVersion, deployment }
        const client = new AzureOpenAI(options);
        try {
            const response = await client.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0,
                model: deployment
            });

            const result = response.choices[0].message.content ?? "";
            return JSON.parse(result.replace(/```json\n?|\n?```/g, "")) 

        } catch (error) {
            console.error("Error calling Azure OpenAI API:", error);
            throw new Error("Failed to generate response from Azure OpenAI.");
        }

    }
}