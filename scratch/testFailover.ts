import fs from 'fs';
import path from 'path';

// 1. Load env variables from .env.local BEFORE importing other modules
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

// Override fallback models specifically to test failover behavior
process.env.PRIMARY_MODEL = 'google/gemini-2.5-flash:free'; // Invalid free slug -> will throw HTTP 404
process.env.FALLBACK_MODEL_1 = 'meta-llama/llama-3.2-1b-instruct:free'; // Invalid free slug -> will throw HTTP 404
process.env.FALLBACK_MODEL_2 = 'meta-llama/llama-3.3-70b-instruct:free'; // Rate limit -> will throw HTTP 429
process.env.FALLBACK_MODEL_3 = 'google/gemini-2.5-flash'; // Paid model -> will succeed!

async function testFailover() {
  console.log("====================================================");
  console.log("STARTING MULTI-MODEL FAILOVER TEST");
  console.log("====================================================");
  
  const { OpenRouterProvider } = await import('../lib/oracle/openRouterProvider');
  const provider = new OpenRouterProvider();

  try {
    const response = await provider.generate({
      systemPrompt: "You are a professional assistant. Say hello and state your model name.",
      userPrompt: "Hello, who are you?"
    });

    console.log("\n----------------------------------------------------");
    console.log("TEST SUCCESSFUL!");
    console.log("AI RESPONSE:");
    console.log(response.text.trim());
    console.log("----------------------------------------------------");
  } catch (err: any) {
    console.error("\n----------------------------------------------------");
    console.error("TEST FAILED!");
    console.error(err.message || err);
    console.error("----------------------------------------------------");
  }
}

testFailover();
