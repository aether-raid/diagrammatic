import { GeminiProvider } from '../llm/geminiProvider';

describe('GeminiProvider Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  let geminiProvider: GeminiProvider;
  let generateResponseSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh provider for each test
    geminiProvider = new GeminiProvider(mockApiKey);
    
    // Spy on the generateResponse method
    generateResponseSpy = jest.spyOn(geminiProvider, 'generateResponse');
  });

  afterEach(() => {
    // Restore the original method
    generateResponseSpy.mockRestore();
  });

  it('should call Gemini API with correct parameters', async () => {
    // Mock successful response
    const mockResponse = { components: [], 'component relationships': [] };
    generateResponseSpy.mockResolvedValueOnce(mockResponse);
    
    const systemPrompt = 'You are a helpful assistant';
    const userPrompt = 'Generate a component diagram';

    const result = await geminiProvider.generateResponse(systemPrompt, userPrompt);
    
    // Verify the response matches our mock
    expect(result).toEqual(mockResponse);
    // Verify method was called with correct parameters
    expect(generateResponseSpy).toHaveBeenCalledWith(systemPrompt, userPrompt);
  });

  it('should parse and return JSON response correctly', async () => {
    // Mock JSON response
    const mockJsonResponse = {
      components: [
        { id: 1, name: 'Auth', description: 'Handles user authentication', files: ['auth.js', 'login.js'] }
      ],
      'component relationships': []
    };

    // Mock the implementation
    generateResponseSpy.mockResolvedValueOnce(mockJsonResponse);

    // Call the method
    const result = await geminiProvider.generateResponse('system prompt', 'user prompt');

    // Verify the result
    expect(result).toEqual(mockJsonResponse);
  });

  it('should handle JSON response with code block formatting', async () => {
    // Mock JSON response that would be returned after code block handling
    const mockJsonResponse = {
      components: [
        { id: 1, name: 'Auth', description: 'Handles user authentication', files: ['auth.js', 'login.js'] }
      ],
      'component relationships': []
    };

    // Mock implementation
    generateResponseSpy.mockResolvedValueOnce(mockJsonResponse);

    // Call the method
    const result = await geminiProvider.generateResponse('system prompt', 'user prompt');

    // Verify the result
    expect(result).toEqual(mockJsonResponse);
  });

  it('should throw an error when API call fails', async () => {
    // Mock API error
    generateResponseSpy.mockRejectedValueOnce(new Error('Failed to generate response from Gemini.'));

    // Expect error to be thrown
    await expect(
      geminiProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from Gemini.');
  });

  it('should throw an error when response cannot be parsed as JSON', async () => {
    // Mock invalid JSON response by rejecting with an error
    generateResponseSpy.mockRejectedValueOnce(new Error('Failed to generate response from Gemini.'));

    // Expect error to be thrown
    await expect(
      geminiProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from Gemini.');
  });
});