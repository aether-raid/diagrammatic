import axios from 'axios';
import { OpenAIProvider } from '../llm/openAiProvider';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenAIProvider Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  let openAIProvider: OpenAIProvider;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    openAIProvider = new OpenAIProvider(mockApiKey);
    
    // Mock console methods to prevent test output noise
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    
    // Reset timers
    jest.useRealTimers();
  });

  it('should call OpenAI API with correct parameters', async () => {
    // Mock successful API response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: '{"result": "success"}'
            }
          }
        ]
      }
    });

    const systemPrompt = 'You are a helpful assistant';
    const userPrompt = 'Generate a component diagram';

    await openAIProvider.generateResponse(systemPrompt, userPrompt);

    // Verify axios was called with correct URL
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${mockApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('should parse and return JSON response correctly', async () => {
    // Mock JSON response
    const mockJsonResponse = {
      components: [
        { id: 1, name: 'Auth', description: 'Handles user authentication', files: ['auth.js', 'login.js'] }
      ],
      'component relationships': []
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify(mockJsonResponse)
            }
          }
        ]
      }
    });

    const result = await openAIProvider.generateResponse('system prompt', 'user prompt');

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

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: '```json\n' + JSON.stringify(mockJsonResponse) + '\n```'
            }
          }
        ]
      }
    });

    const result = await openAIProvider.generateResponse('system prompt', 'user prompt');

    expect(result).toEqual(mockJsonResponse);
  });

  it('should throw an error when API call fails', async () => {
    // Mock API error - all attempts will fail
    for (let i = 0; i < 5; i++) {
      mockedAxios.post.mockRejectedValueOnce(new Error('API error'));
    }
    
    // Disable the retry mechanism for this test by mocking setTimout
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback(); // Execute the callback immediately
      return 0 as any; // Return a timer ID
    });

    await expect(
      openAIProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from OpenAI after 5 attempts');
  });

  it('should throw an error when response cannot be parsed as JSON', async () => {
    // Mock invalid JSON response for all attempts
    for (let i = 0; i < 5; i++) {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'This is not valid JSON'
              }
            }
          ]
        }
      });
    }
    
    // Disable the retry mechanism for this test
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback(); // Execute the callback immediately
      return 0 as any; // Return a timer ID
    });

    await expect(
      openAIProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from OpenAI after 5 attempts');
  });

  it('should retry on failure before eventually succeeding', async () => {
    // First attempt fails, second succeeds
    mockedAxios.post
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: '{"result": "success after retry"}'
              }
            }
          ]
        }
      });
    
    // Disable the retry delay for this test
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback(); // Execute the callback immediately
      return 0 as any; // Return a timer ID
    });

    const result = await openAIProvider.generateResponse('system prompt', 'user prompt');
    
    expect(result).toEqual({ result: "success after retry" });
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});