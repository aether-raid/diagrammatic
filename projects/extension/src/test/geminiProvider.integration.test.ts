import axios from 'axios';
import { GeminiProvider } from '../llm/geminiProvider';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeminiProvider Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  let geminiProvider: GeminiProvider;

  beforeEach(() => {
    geminiProvider = new GeminiProvider(mockApiKey);
    jest.clearAllMocks();
  });

  it('should call Gemini API with correct parameters', async () => {
    // Mock successful API response with proper structure
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            content: {
              parts: [
                { text: '{"components":[{"id":1}]}' }
              ]
            }
          }
        ]
      }
    });

    const systemPrompt = 'You are a helpful assistant';
    const userPrompt = 'Generate a component diagram';

    await geminiProvider.generateResponse(systemPrompt, userPrompt);

    // Verify axios was called with correct URL and params
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({
            parts: expect.arrayContaining([
              expect.objectContaining({
                text: expect.stringContaining(userPrompt)
              })
            ])
          })
        ])
      }),
      expect.objectContaining({
        params: expect.objectContaining({
          key: mockApiKey
        })
      })
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
        candidates: [
          {
            content: {
              parts: [
                { text: JSON.stringify(mockJsonResponse) }
              ]
            }
          }
        ]
      }
    });

    const result = await geminiProvider.generateResponse('system prompt', 'user prompt');

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
        candidates: [
          {
            content: {
              parts: [
                { text: '```json\n' + JSON.stringify(mockJsonResponse) + '\n```' }
              ]
            }
          }
        ]
      }
    });

    const result = await geminiProvider.generateResponse('system prompt', 'user prompt');

    expect(result).toEqual(mockJsonResponse);
  });

  it('should throw an error when API call fails', async () => {
    // Mock API error
    mockedAxios.post.mockRejectedValueOnce(new Error('API error'));

    await expect(
      geminiProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from Gemini');
  });

  it('should throw an error when response cannot be parsed as JSON', async () => {
    // Mock invalid JSON response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            content: {
              parts: [
                { text: 'This is not valid JSON' }
              ]
            }
          }
        ]
      }
    });

    await expect(
      geminiProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from Gemini');
  });
});