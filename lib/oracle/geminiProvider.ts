import { IAIProvider, AIProviderRequest, AIProviderResponse } from './aiProvider';
import { analyticsService } from './analyticsService';

export class GeminiProvider implements IAIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    console.log("GEMINI_REQUEST");
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined.');
    }

    try {
      const result = await this.executeGemini(request);
      console.log("GEMINI_SUCCESS");
      
      analyticsService.recordProviderCall({
        model: 'gemini-2.5-flash',
        success: true,
        isFailover: false
      });

      return result;
    } catch (error: any) {
      analyticsService.recordProviderCall({
        model: 'gemini-2.5-flash',
        success: false,
        errorCode: error.status || (error.message?.includes('429') ? 429 : undefined),
        errorMessage: error.message || String(error),
        isFailover: false
      });

      throw error;
    }
  }

  private async executeGemini(request: AIProviderRequest): Promise<AIProviderResponse> {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timeoutMs = request.config?.timeoutMs || 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: request.userPrompt }]
            }
          ],
          systemInstruction: {
            parts: [{ text: request.systemPrompt }]
          },
          generationConfig: {
            temperature: request.config?.temperature || 0.7,
            maxOutputTokens: request.config?.maxTokens || 1000
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        const err = new Error(`Gemini API returned status ${response.status}: ${errorText}`);
        (err as any).status = response.status;
        throw err;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Invalid or empty response structure from Gemini API.');
      }

      const promptTokens = data.usageMetadata?.promptTokenCount || 0;
      const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;
      const totalTokens = data.usageMetadata?.totalTokenCount || 0;

      return {
        text,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          modelUsed: model
        }
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const timeoutError = new Error(`Gemini API request timed out after ${timeoutMs}ms.`);
        (timeoutError as any).name = 'AbortError';
        throw timeoutError;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export default GeminiProvider;
