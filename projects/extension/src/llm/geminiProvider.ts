import { LLMProvider } from "../helpers/llm";
import { GoogleGenerativeAI } from "@google/generative-ai";
export class GeminiProvider implements LLMProvider {
    private apiKey: string;

    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
    async generateResponse(systemPrompt: string, userPrompt: string): Promise<string> {
        try {
            const gemini = new GoogleGenerativeAI(this.apiKey);
            const model = gemini.getGenerativeModel({
                model: "gemini-1.5-flash-latest",
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
            const result = await model.generateContent(userPrompt)
            return JSON.parse(result.response.text()); // Extract response text
          } catch (error) {
            console.error("Error calling Gemini API:", error);
            throw new Error("Failed to generate response from Gemini.");
          }
    } 
}