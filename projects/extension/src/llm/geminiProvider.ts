import { LLMProvider } from "../helpers/llm";
import { GoogleGenerativeAI } from "@google/generative-ai";
export class GeminiProvider implements LLMProvider {
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
        const gemini = new GoogleGenerativeAI(this.apiKey);
        const model = gemini.getGenerativeModel({
          model: "gemini-2.0-flash-lite",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0
          }
        })
        const result = await model.generateContent(userPrompt)
        return JSON.parse(result.response.text()); // Extract response text}
      }
      catch (error) {
        console.error("Error calling Gemini API:", error);
        lastError = error;
        if (attempt < this.maxRetries) {
          console.log(`Retrying in ${this.retryDelayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelayMs)); // Wait before retrying
        }
      }
    }
    if (lastError) {
      throw new Error(`Failed to generate response from Gemini after ${this.maxRetries} attempts: ${lastError.message}`);
    }
  }
}