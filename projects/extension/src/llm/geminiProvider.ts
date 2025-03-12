import axios from "axios";
import { LLMProvider } from "../helpers/llm";
import { GoogleGenerativeAI } from "@google/generative-ai";
export class GeminiProvider implements LLMProvider {
    private apiKey: string;

    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
    async generateResponse(systemPrompt: string, userPrompt: string): Promise<string> {
    } 
}