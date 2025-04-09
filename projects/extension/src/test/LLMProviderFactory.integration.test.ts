import { retrieveLLMProvider, LLMProvider } from '../helpers/llm';
import { OpenAIProvider } from '../llm/openAiProvider';
import { GeminiProvider } from '../llm/geminiProvider';
import { AzureOpenAIProvider } from '../llm/azureOpenAiProvider';
import { GLOBALS } from '../globals';
import * as configModule from '../helpers/common';
import * as uriParamsModule from '../helpers/uriParameters';
import axios from 'axios';

// Mock the config retrieval functions
jest.mock('../helpers/common', () => ({
  retrieveExtensionConfig: jest.fn()
}));

// Mock the URI parameters retrieval function
jest.mock('../helpers/uriParameters', () => ({
  retrieveUriParameters: jest.fn()
}));

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LLM Provider Factory Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock for axios post
    mockedAxios.post.mockResolvedValue({ 
      data: { choices: [{ message: { content: '{}' } }] } 
    });
  });

  it('should create an OpenAI provider when openai is configured', () => {
    // Mock configuration to return OpenAI
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('openai');
    
    // Call the factory function
    const provider = retrieveLLMProvider(mockApiKey);
    
    // Verify it returns an OpenAI provider
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it('should create a Gemini provider when gemini is configured', () => {
    // Mock configuration to return Gemini
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('gemini');
    
    // Call the factory function
    const provider = retrieveLLMProvider(mockApiKey);
    
    // Verify it returns a Gemini provider
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it('should create an Azure OpenAI provider when azure-openai is configured', () => {
    // Mock configuration to return Azure OpenAI
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('azure-openai');
    
    // Mock URI parameters
    (uriParamsModule.retrieveUriParameters as jest.Mock).mockReturnValue({
      endpoint: 'https://test-endpoint.openai.azure.com',
      deployment: 'test-deployment',
      apiVersion: '2023-05-15'
    });
    
    // Call the factory function
    const provider = retrieveLLMProvider(mockApiKey);
    
    // Verify it returns an Azure OpenAI provider
    expect(provider).toBeInstanceOf(AzureOpenAIProvider);
  });

  it('should throw an error for unknown provider configurations', () => {
    // Mock configuration to return unknown provider
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('unknown-provider');
    
    // Verify it throws an error
    expect(() => retrieveLLMProvider(mockApiKey)).toThrow('No LLM provider selected.');
  });

  it('should pass the API key to the OpenAI provider', async () => {
    // Mock configuration to return OpenAI
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('openai');
    
    // Create a provider instance
    const provider = retrieveLLMProvider(mockApiKey);
    
    // Call generateResponse to trigger an API call
    try {
      await provider.generateResponse('system', 'user');
    } catch (e) {
      // Ignore errors, we just want to check the API key was passed
    }
    
    // Check that axios was called with the correct auth header
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockApiKey}`
        })
      })
    );
  });

  it('should pass endpoint, deployment and apiVersion to Azure OpenAI provider', async () => {
    // Mock configuration to return Azure OpenAI
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('azure-openai');
    
    // Mock URI parameters
    const mockParams = {
      endpoint: 'https://test-endpoint.openai.azure.com',
      deployment: 'test-deployment',
      apiVersion: '2023-05-15'
    };
    
    (uriParamsModule.retrieveUriParameters as jest.Mock).mockReturnValue(mockParams);
    
    // Create a provider instance
    const provider = retrieveLLMProvider(mockApiKey);
    
    // Mock axios post for Azure
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: '{}' } }]
      }
    });
    
    // Call generateResponse to trigger an API call
    try {
      await provider.generateResponse('system', 'user');
    } catch (e) {
      // Ignore errors, we just want to check the URL construction
    }
    
    // Verify the URL contains the endpoint, deployment and apiVersion
    const expectedUrlPattern = new RegExp(
      `${mockParams.endpoint}/.*/${mockParams.deployment}/.*\\?api-version=${mockParams.apiVersion}`
    );
    
    // Check if any call to axios.post matches our expected URL pattern
    const callArgs = mockedAxios.post.mock.calls;
    let foundMatch = false;
    
    for (const args of callArgs) {
      const url = args[0];
      if (typeof url === 'string' && expectedUrlPattern.test(url)) {
        foundMatch = true;
        break;
      }
    }
    
    expect(foundMatch).toBe(true);
  });
});