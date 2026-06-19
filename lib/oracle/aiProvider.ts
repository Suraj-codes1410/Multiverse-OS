import { ModelConfig } from './config';

export interface AIProviderRequest {
  systemPrompt: string;
  userPrompt: string;
  config?: ModelConfig;
}

export interface AIProviderResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    modelUsed?: string;
  };
}

export interface IAIProvider {
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
}
