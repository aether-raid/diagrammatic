import { LLMProvider } from "../helpers/llm";
import { AzureOpenAI } from "openai";

export class AzureOpenAIProvider implements LLMProvider {
    private readonly apiKey: string;
    private readonly endpoint: string;
    private readonly deployment: string;
    private readonly apiVersion: string
    private readonly maxRetries: number = 5;
    private readonly retryDelayMs: number = 1000;

    constructor(apiKey: string, endpoint: string, deployment: string, apiVersion: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.deployment = deployment;
        this.apiVersion = apiVersion;
    }

    async generateResponse(systemPrompt: string, userPrompt: string): Promise<any> {
        const endpoint = this.endpoint;
        const apiKey = this.apiKey;
        const apiVersion = this.apiVersion;
        const deployment = this.deployment;
        const options = { endpoint, apiKey, apiVersion, deployment }
        const client = new AzureOpenAI(options);

        let attempt = 0;
        let lastError: any;
        while (attempt < this.maxRetries) {
            attempt++;
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
                return JSON.parse(result.replace(/```json\n?|\n?```/g, ""));

            } catch (error) {
                console.error("Error calling Azure OpenAI API:", error);
                lastError = error;
                const waitTime = this.retryDelayMs * Math.pow(2, attempt); // exponential backoff
                if (attempt < this.maxRetries) {
                    console.log(`Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime)); // Wait before retrying
                }
            }
        }

        if (lastError) {
            throw new Error(`Failed to generate response from Azure OpenAI after ${this.maxRetries} attempts: ${lastError.message}`);
        }
    }
}