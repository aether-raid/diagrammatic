import { retrieveLLMProvider } from '../helpers/llm';
import { OpenAIProvider } from '../llm/openAiProvider';
import { GeminiProvider } from '../llm/geminiProvider';
import { AzureOpenAIProvider } from '../llm/azureOpenAiProvider';
import * as configModule from '../helpers/common';
import * as uriParamsModule from '../helpers/uriParameters';

// Mock the classes before importing them
jest.mock('../llm/openAiProvider');
jest.mock('../llm/geminiProvider');
jest.mock('../llm/azureOpenAiProvider');

// Mock the config retrieval functions
jest.mock('../helpers/common', () => ({
  retrieveExtensionConfig: jest.fn()
}));

// Mock the URI parameters retrieval function
jest.mock('../helpers/uriParameters', () => ({
  retrieveUriParameters: jest.fn()
}));

// Set up the mocks to return proper instances
beforeEach(() => {
  // Reset the constructor mocks and set them up to return objects
  // that pass the instanceof check
  (OpenAIProvider as jest.Mock).mockImplementation(function() {
    return Object.create(OpenAIProvider.prototype);
  });
  
  (GeminiProvider as jest.Mock).mockImplementation(function() {
    return Object.create(GeminiProvider.prototype);
  });
  
  (AzureOpenAIProvider as jest.Mock).mockImplementation(function() {
    return Object.create(AzureOpenAIProvider.prototype);
  });
});

describe('LLM Provider Factory Integration Tests', () => {
  const mockApiKey = 'test-api-key';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an OpenAI provider when openai is configured', () => {
    // Mock configuration to return OpenAI
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('openai');
    
    // Call the factory function
    const provider = retrieveLLMProvider(mockApiKey);
    
    // Verify it returns an OpenAI provider
    expect(provider).toBeInstanceOf(OpenAIProvider);
    
    // Verify the constructor was called with the API key
    expect(OpenAIProvider).toHaveBeenCalledWith(mockApiKey);
  });

  it('should create a Gemini provider when gemini is configured', () => {
    // Mock configuration to return Gemini
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('gemini');
    
    // Call the factory function
    const provider = retrieveLLMProvider(mockApiKey);
    
    // Verify it returns a Gemini provider
    expect(provider).toBeInstanceOf(GeminiProvider);
    
    // Verify the constructor was called with the API key
    expect(GeminiProvider).toHaveBeenCalledWith(mockApiKey);
  });

  it('should create an Azure OpenAI provider when azure-openai is configured', () => {
    // Mock configuration to return Azure OpenAI
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('azure-openai');
    
    // Mock URI parameters
    const mockParams = {
      endpoint: 'https://test-endpoint.openai.azure.com',
      deployment: 'test-deployment',
      apiVersion: '2023-05-15'
    };
    
    (uriParamsModule.retrieveUriParameters as jest.Mock).mockReturnValue(mockParams);
    
    // Call the factory function
    const provider = retrieveLLMProvider(mockApiKey);
    
    // Verify it returns an Azure OpenAI provider
    expect(provider).toBeInstanceOf(AzureOpenAIProvider);
    
    // Verify the constructor was called with the correct parameters
    expect(AzureOpenAIProvider).toHaveBeenCalledWith(
      mockApiKey,
      mockParams.endpoint,
      mockParams.deployment,
      mockParams.apiVersion
    );
  });

  it('should throw an error for unknown provider configurations', () => {
    // Mock configuration to return unknown provider
    (configModule.retrieveExtensionConfig as jest.Mock).mockReturnValue('unknown-provider');
    
    // Verify it throws an error
    expect(() => retrieveLLMProvider(mockApiKey)).toThrow('No LLM provider selected.');
  });
});