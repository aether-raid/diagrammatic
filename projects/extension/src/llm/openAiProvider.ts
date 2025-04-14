import axios from "axios";
import { LLMProvider } from "../helpers/llm";

export class OpenAIProvider implements LLMProvider {
    private readonly apiKey: string;
    private readonly maxRetries: number = 5;
    private readonly retryDelayMs: number = 1000;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(systemPrompt: string, userPrompt: string): Promise<any> {
        let attempt = 0;
        let lastError: any;
        while (attempt < this.maxRetries) {
            attempt++;
            try {
                const response = await axios.post(
                    "https://api.openai.com/v1/chat/completions",
                    {
                        model: "gpt-4-turbo",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt },
                        ],
                        temperature: 0,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.apiKey}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                return JSON.parse(response.data.choices[0].message.content.replace(/```json\n?|\n?```/g, ""));
            } catch (error) {
                console.error("Error calling OpenAI API:", error);
                lastError = error;
                const waitTime = this.retryDelayMs * Math.pow(2, attempt); // exponential backoff
                if (attempt < this.maxRetries) {
                    console.log(`Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime)); // Wait before retrying
                }
            }
        }

        if (lastError) {
            throw new Error(`Failed to generate response from OpenAI after ${this.maxRetries} attempts: ${lastError.message}`);
        }
    }
}