import { GeminiProvider } from '../llm/geminiProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define mock types and functions
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent
});

// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel
  }))
}));

describe('GeminiProvider Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  let geminiProvider: GeminiProvider;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Create a fresh provider for each test
    geminiProvider = new GeminiProvider(mockApiKey);
    
    // Default mock implementation
    mockGenerateContent.mockResolvedValue({
      response: { text: () => '{"result": "success"}' }
    });
  });

  afterEach(() => {
    // Restore console mocks
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    
    // Reset timers if used
    jest.useRealTimers();
  });

  it('should initialize Gemini with correct parameters', async () => {
    const userPrompt = 'Generate a component diagram';
    await geminiProvider.generateResponse('system prompt', userPrompt);
    
    // Verify GoogleGenerativeAI was initialized with the API key
    expect(GoogleGenerativeAI).toHaveBeenCalledWith(mockApiKey);
    
    // Verify model was initialized with correct parameters
    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0
      }
    });
    
    // Verify generateContent was called with the user prompt
    expect(mockGenerateContent).toHaveBeenCalledWith(userPrompt);
  });

  it('should parse and return JSON response correctly', async () => {
    // Mock response
    const mockJsonResponse = {
      components: [
        { id: 1, name: 'Auth', description: 'Handles user authentication', files: ['auth.js', 'login.js'] }
      ],
      'component relationships': []
    };
    
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(mockJsonResponse) }
    });

    // Call the method
    const result = await geminiProvider.generateResponse('system prompt', 'user prompt');

    // Verify the result
    expect(result).toEqual(mockJsonResponse);
  });

  it('should handle JSON response with code block formatting', async () => {
    // Mock response with code blocks
    const mockJsonResponse = {
      components: [
        { id: 1, name: 'Auth', description: 'Handles user authentication', files: ['auth.js', 'login.js'] }
      ],
      'component relationships': []
    };
    
    // Override the default implementation specifically for this test
    mockGenerateContent.mockReset().mockResolvedValue({
      response: { 
        text: () => '```json\n' + JSON.stringify(mockJsonResponse) + '\n```'
      }
    });

    // Call the method
    const result = await geminiProvider.generateResponse('system prompt', 'user prompt');

    // Verify the result matches what we'd expect after code block removal
    expect(result).toEqual(mockJsonResponse);
  });

  it('should retry on API errors', async () => {
    // Use fake timers
    jest.useFakeTimers({ advanceTimers: true });
    
    // First call fails, second succeeds
    mockGenerateContent
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce({
        response: { text: () => '{"result": "success after retry"}' }
      });
    
    const resultPromise = geminiProvider.generateResponse('system prompt', 'user prompt');
    
    // Fast-forward through all pending timers
    jest.runAllTimers();
    
    // Now await the result
    const result = await resultPromise;
    
    // Verify retry behavior
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ result: 'success after retry' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error calling Gemini API:',
      expect.any(Error)
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Retrying in'));
  });

  it('should throw an error after max retries', async () => {
    // Use fake timers with automatic advancement
    jest.useFakeTimers({ advanceTimers: true });
    
    // All calls fail
    mockGenerateContent.mockRejectedValue(new Error('API error'));
    
    const resultPromise = geminiProvider.generateResponse('system prompt', 'user prompt');
    
    // Fast-forward through all pending timers
    jest.runAllTimers();
    
    // Now await the rejection
    await expect(resultPromise).rejects.toThrow('Failed to generate response from Gemini after 5 attempts');
    
    // Verify all 5 retries were attempted
    expect(mockGenerateContent).toHaveBeenCalledTimes(5);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(5);
  });

  it('should throw an error when response cannot be parsed as JSON', async () => {
    // Use fake timers with automatic advancement
    jest.useFakeTimers({ advanceTimers: true });
    
    // Response contains invalid JSON
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'This is not valid JSON' }
    });
    
    const resultPromise = geminiProvider.generateResponse('system prompt', 'user prompt');
    
    // Fast-forward through all pending timers
    jest.runAllTimers();
    
    // Now await the rejection
    await expect(resultPromise).rejects.toThrow('Failed to generate response from Gemini after 5 attempts');
    
    // Verify JSON parse error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error calling Gemini API:',
      expect.any(SyntaxError)
    );
  });

});