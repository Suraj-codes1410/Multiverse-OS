export class EnvironmentValidator {
  public static validate(): { ok: boolean; missing: string[] } {
    console.log("STARTUP_VALIDATION");
    
    const requiredEnv = [
      'OPENROUTER_API_KEY',
      'GITHUB_TOKEN',
      'PRIMARY_MODEL',
      'FALLBACK_MODEL_1',
      'FALLBACK_MODEL_2',
      'GITHUB_SYNC_INTERVAL_MS'
    ];
    
    const missing: string[] = [];
    requiredEnv.forEach(env => {
      if (!process.env[env]) {
        missing.push(env);
      }
    });

    if (missing.length > 0) {
      console.warn("======================================================================");
      console.warn("⚠️ ORACLE STARTUP WARNING: Missing production environment configuration.");
      console.warn("Missing variables:", missing.join(', '));
      console.warn("Oracle will run with local mock data and degraded failover modes.");
      console.warn("======================================================================");
      
      // Setup default fallback configs gracefully to prevent crashes
      if (!process.env.PRIMARY_MODEL) {
        process.env.PRIMARY_MODEL = 'deepseek/deepseek-r1:free';
      }
      if (!process.env.FALLBACK_MODEL_1) {
        process.env.FALLBACK_MODEL_1 = 'meta-llama/llama-3.3-70b-instruct:free';
      }
      if (!process.env.FALLBACK_MODEL_2) {
        process.env.FALLBACK_MODEL_2 = 'qwen/qwen3-32b:free';
      }
      if (!process.env.GITHUB_SYNC_INTERVAL_MS) {
        process.env.GITHUB_SYNC_INTERVAL_MS = '3600000';
      }
      
      return { ok: false, missing };
    }

    console.log("ENVIRONMENT_OK");
    return { ok: true, missing };
  }
}
export default EnvironmentValidator;
