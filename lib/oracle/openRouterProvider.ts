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

    const primaryModel = process.env.PRIMARY_MODEL || config.modelName || 'deepseek/deepseek-r1:free';
    const fallback1 = process.env.FALLBACK_MODEL_1 || 'meta-llama/llama-3.3-70b-instruct:free';
    const fallback2 = process.env.FALLBACK_MODEL_2 || 'qwen/qwen3-32b:free';
    const fallback3 = process.env.FALLBACK_MODEL_3 || 'nvidia/nemotron-3-ultra-550b-a55b:free';

    const modelsToTry = [primaryModel, fallback1, fallback2, fallback3];
    const uniqueModels = Array.from(new Set(modelsToTry.filter(Boolean)));

    let lastError: any = null;

    for (let i = 0; i < uniqueModels.length; i++) {
      const currentModel = uniqueModels[i];
      console.log(`MODEL_ATTEMPT: ${currentModel}`);

      try {
        const response = await this.executeGenerate(request, currentModel, timeoutMs);
        console.log(`MODEL_SUCCESS: ${currentModel}`);
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Model used: ${currentModel}`);
        }
        return response;
      } catch (error: any) {
        console.log(`MODEL_FAIL: ${currentModel} | Error: ${error.message || error}`);
        lastError = error;

        // Check if we should retry/failover
        if (i < uniqueModels.length - 1) {
          if (this.isRetryableError(error)) {
            const nextModel = uniqueModels[i + 1];
            console.log(`MODEL_FALLBACK: ${currentModel} -> ${nextModel}`);
            continue;
          } else {
            console.log(`Non-retryable error encountered. Aborting failover chain.`);
            break;
          }
        }
      }
    }

    throw lastError || new Error('All configured models failed to generate a response.');
  }

  private isRetryableError(error: any): boolean {
    if (!error) return false;

    // 1. Timeout errors
    if (error.name === 'AbortError' || error.message?.toLowerCase().includes('timeout') || error.message?.toLowerCase().includes('timed out')) {
      return true;
    }

    const status = error.status;
    const body = error.body || '';
    const message = error.message || '';

    // 2. HTTP Status checks
    if (status) {
      if (status === 429 || (status >= 500 && status < 600)) {
        return true;
      }
      if (status === 401 || status === 400) {
        return false;
      }
    }

    // 3. Provider unavailable / no endpoints error checks
    const lowercaseBody = body.toLowerCase();
    const lowercaseMessage = message.toLowerCase();

    const providerUnavailablePhrases = [
      'provider unavailable',
      'no endpoints found',
      'temporarily rate-limited',
      'rate-limited upstream',
      'upstream error',
      'provider error',
      'resource unavailable',
      'capacity exceeded'
    ];

    const isProviderUnavailable = providerUnavailablePhrases.some(phrase => 
      lowercaseBody.includes(phrase) || lowercaseMessage.includes(phrase)
    );

    if (isProviderUnavailable) {
      return true;
    }

    if (status === 404) {
      return true;
    }

    return false;
  }

  private async executeGenerate(
    request: AIProviderRequest, 
    modelName: string, 
    timeoutMs: number
  ): Promise<AIProviderResponse> {
    const config = request.config || DEFAULT_MODEL_CONFIG;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`CALLING OPENROUTER with model: ${modelName}`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://multiverse-os.local', // Referer header for OpenRouter analytics
          'X-Title': 'Multiverse OS Oracle'
        },
        body: JSON.stringify({
          model: modelName,
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
        const error = new Error(`OpenRouter API returned error status ${response.status}: ${errorText}`);
        (error as any).status = response.status;
        (error as any).body = errorText;
        throw error;
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('Invalid response structure received from OpenRouter API.');
      }

      const text = data.choices[0].message?.content || '';
      console.log("OPENROUTER SUCCESS");

      const usage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        modelUsed: modelName
      };

      return {
        text,
        usage
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error(`OpenRouter API request timed out after ${timeoutMs}ms.`);
        (timeoutError as any).name = 'AbortError';
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
export default OpenRouterProvider;
