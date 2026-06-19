import { IAIProvider, AIProviderRequest, AIProviderResponse } from './aiProvider';
import { OpenRouterProvider } from './openRouterProvider';
import { GeminiProvider } from './geminiProvider';

class ResilientAIProvider implements IAIProvider {
  private primaryType: string;

  constructor(primaryType: string) {
    this.primaryType = primaryType.toLowerCase();
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (this.primaryType === 'gemini') {
      try {
        const gemini = new GeminiProvider();
        return await gemini.generate(request);
      } catch (error) {
        console.log("GEMINI_FAIL");
        console.log("PROVIDER_FALLBACK");
        const openrouter = new OpenRouterProvider();
        return await openrouter.generate(request);
      }
    } else {
      try {
        const openrouter = new OpenRouterProvider();
        return await openrouter.generate(request);
      } catch (error) {
        if (process.env.GEMINI_API_KEY) {
          console.log("OPENROUTER_FAIL");
          console.log("PROVIDER_FALLBACK");
          const gemini = new GeminiProvider();
          return await gemini.generate(request);
        }
        throw error;
      }
    }
  }
}

export class ProviderFactory {
  static create(): IAIProvider {
    const providerType = process.env.AI_PROVIDER || 'openrouter';
    console.log("PROVIDER_SELECTED");
    console.log(providerType);

    return new ResilientAIProvider(providerType);
  }
}

export default ProviderFactory;
