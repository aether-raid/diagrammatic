import axios from 'axios';
import { AzureOpenAIProvider } from '../llm/azureOpenAiProvider';
import { AzureOpenAI } from 'openai';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a mock for chat.completions.create
const mockCreateMethod = jest.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: '{"result": "success"}'
      }
    }
  ]
});

// Mock OpenAI SDK
jest.mock('openai', () => {
  return { 
    AzureOpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreateMethod
        }
      }
    }))
  };
});

describe('AzureOpenAIProvider Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  const mockEndpoint = 'https://test-endpoint.openai.azure.com';
  const mockDeployment = 'test-deployment';
  const mockApiVersion = '2023-05-15';
  
  let azureOpenAIProvider: AzureOpenAIProvider;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.error to prevent test output noise
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Create a new provider for each test
    azureOpenAIProvider = new AzureOpenAIProvider(
      mockApiKey,
      mockEndpoint,
      mockDeployment,
      mockApiVersion
    );
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
    
    // Reset timers if they were used
    jest.useRealTimers();
  });

  it('should call Azure OpenAI API with correct parameters', async () => {
    // Set up successful response
    mockCreateMethod.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"test": "success"}'
          }
        }
      ]
    });
    
    const systemPrompt = 'You are a helpful assistant';
    const userPrompt = 'Generate a component diagram';

    const result = await azureOpenAIProvider.generateResponse(systemPrompt, userPrompt);
    
    // Verify the client was called with correct parameters
    expect(mockCreateMethod).toHaveBeenCalledWith({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0,
      model: mockDeployment
    });
    
    expect(result).toEqual({ test: 'success' });
  });

  it('should parse and return JSON response correctly', async () => {
    // Mock JSON response
    const mockJsonResponse = {
      components: [
        { id: 1, name: 'Auth', description: 'Handles user authentication', files: ['auth.js', 'login.js'] }
      ],
      'component relationships': []
    };

    // Set up mock response
    mockCreateMethod.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify(mockJsonResponse)
          }
        }
      ]
    });
    
    const result = await azureOpenAIProvider.generateResponse('system prompt', 'user prompt');

    expect(result).toEqual(mockJsonResponse);
  });

  it('should handle JSON response with code block formatting', async () => {
    // Mock JSON response wrapped in markdown code blocks
    const mockJsonResponse = {
      components: [
        { id: 1, name: 'Auth', description: 'Handles user authentication', files: ['auth.js', 'login.js'] }
      ],
      'component relationships': []
    };

    // Set up mock response with code blocks
    mockCreateMethod.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '```json\n' + JSON.stringify(mockJsonResponse) + '\n```'
          }
        }
      ]
    });

    const result = await azureOpenAIProvider.generateResponse('system prompt', 'user prompt');

    expect(result).toEqual(mockJsonResponse);
  });

  it('should retry on API errors', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback(); // Execute the callback immediately
      return 0 as any;
    });
    
    // First call fails, second succeeds
    mockCreateMethod
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '{"result": "success after retry"}'
            }
          }
        ]
      });
    
    const result = await azureOpenAIProvider.generateResponse('system prompt', 'user prompt');
    
    expect(result).toEqual({ result: 'success after retry' });
    expect(mockCreateMethod).toHaveBeenCalledTimes(2);
  });

  it('should throw an error after max retries', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback(); // Execute the callback immediately
      return 0 as any;
    });
    
    // All calls fail
    mockCreateMethod.mockRejectedValue(new Error('API error'));
    
    await expect(
      azureOpenAIProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from Azure OpenAI after 5 attempts');
  });

  it('should throw an error when response cannot be parsed as JSON', async () => {
    // Use fake timers
    jest.useFakeTimers();
    
    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback(); // Execute the callback immediately
      return 0 as any;
    });
    
    // All responses contain invalid JSON
    mockCreateMethod.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'This is not valid JSON'
          }
        }
      ]
    });
    
    await expect(
      azureOpenAIProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from Azure OpenAI after 5 attempts');
  });
});