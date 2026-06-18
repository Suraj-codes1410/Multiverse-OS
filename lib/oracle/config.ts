export interface ModelConfig {
  provider: 'openrouter' | string;
  modelName: string;
  temperature: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  provider: 'openrouter',
  // Default to NVIDIA Nemotron, but allow configuration via environment variables
  modelName: process.env.ORACLE_MODEL || 'nvidia/nemotron-4-340b-instruct',
  temperature: 0.1, // Low temperature to minimize hallucinations
  maxTokens: 2048, // Standard response budget
  timeoutMs: 60000 // 60 seconds timeout to handle congested OpenRouter queues
};
