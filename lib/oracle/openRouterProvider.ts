import { IAIProvider, AIProviderRequest, AIProviderResponse } from './aiProvider';
import { DEFAULT_MODEL_CONFIG } from './config';

export class OpenRouterProvider implements IAIProvider {
  private apiKey: string;

  constructor() {
    // Read only server-side
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not defined.');
    }

    const config = request.config || DEFAULT_MODEL_CONFIG;
    const timeoutMs = config.timeoutMs || 30000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log("CALLING OPENROUTER");
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://multiverse-os.local', // Referer header for OpenRouter analytics
          'X-Title': 'Multiverse OS Oracle'
        },
        body: JSON.stringify({
          model: config.modelName,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API returned error status ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('Invalid response structure received from OpenRouter API.');
      }

      const text = data.choices[0].message?.content || '';
      console.log("OPENROUTER SUCCESS");
      console.log(text.substring(0, 300));

      const usage = data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined;

      return {
        text,
        usage
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`OpenRouter API request timed out after ${timeoutMs}ms.`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
export default OpenRouterProvider;
