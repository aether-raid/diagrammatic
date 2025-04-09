import axios from 'axios';
import { AzureOpenAIProvider } from '../llm/azureOpenAiProvider';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AzureOpenAIProvider Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  const mockEndpoint = 'https://test-endpoint.openai.azure.com';
  const mockDeployment = 'test-deployment';
  const mockApiVersion = '2023-05-15';
  
  let azureOpenAIProvider: AzureOpenAIProvider;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh provider for each test
    azureOpenAIProvider = new AzureOpenAIProvider(
      mockApiKey,
      mockEndpoint,
      mockDeployment,
      mockApiVersion
    );
    
    // Set up default successful response mock
    mockedAxios.post.mockResolvedValue({
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
  });

  it('should call Azure OpenAI API with correct parameters', async () => {
    const systemPrompt = 'You are a helpful assistant';
    const userPrompt = 'Generate a component diagram';

    await azureOpenAIProvider.generateResponse(systemPrompt, userPrompt);

    // Verify axios was called with correct URL
    const expectedUrl = `${mockEndpoint}/openai/deployments/${mockDeployment}/chat/completions`;
    
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining(expectedUrl),
      expect.objectContaining({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ]
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'api-key': mockApiKey
        }),
        params: expect.objectContaining({
          'api-version': mockApiVersion
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
        choices: [
          {
            message: {
              content: JSON.stringify(mockJsonResponse)
            }
          }
        ]
      }
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

    const result = await azureOpenAIProvider.generateResponse('system prompt', 'user prompt');

    expect(result).toEqual(mockJsonResponse);
  });

  it('should throw an error when API call fails', async () => {
    // Mock API error
    mockedAxios.post.mockRejectedValueOnce(new Error('API error'));

    await expect(
      azureOpenAIProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from Azure OpenAI');
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
      azureOpenAIProvider.generateResponse('system prompt', 'user prompt')
    ).rejects.toThrow('Failed to generate response from Azure OpenAI');
  });
});