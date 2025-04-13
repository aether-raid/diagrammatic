import axios from 'axios';
import { OpenAIProvider } from '../llm/openAiProvider'; // Update path as needed

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenAIProvider Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  let openAIProvider: OpenAIProvider;

  beforeEach(() => {
    openAIProvider = new OpenAIProvider(mockApiKey);
    jest.clearAllMocks();
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
    // Mock API error
    mockedAxios.post.mockRejectedValueOnce(new Error('API error'));

    await expect(
      openAIProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to get response from OpenAI.');
  });

  it('should throw an error when response cannot be parsed as JSON', async () => {
    // Mock invalid JSON response
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

    await expect(
      openAIProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow();
  });
});