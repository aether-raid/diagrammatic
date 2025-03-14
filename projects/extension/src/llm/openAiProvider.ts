import axios from "axios";
import { LLMProvider } from "../helpers/llm";

export class OpenAIProvider implements LLMProvider {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(systemPrompt: string, userPrompt: string): Promise<string> {
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
            throw new Error("Failed to get response from OpenAI.");
        }
    }
}