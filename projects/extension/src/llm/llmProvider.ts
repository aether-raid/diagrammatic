export interface LLMProvider {
    generateResponse(systemPrompt:string, userPrompt: string): Promise<any>;
}