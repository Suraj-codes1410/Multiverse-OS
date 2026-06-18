import { OpenRouterProvider } from '../lib/oracle/openRouterProvider';
import { contextService } from '../lib/oracle/service';

async function testOpenRouter() {
  console.log("\n=== Testing OpenRouter Integration ===");
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  WARNING: OPENROUTER_API_KEY environment variable is not defined. Skipping live OpenRouter call.");
    console.log("To run this test, set the environment variable: $env:OPENROUTER_API_KEY=\"your-key\"");
    return;
  }

  try {
    console.log("1. Loading structured Oracle context...");
    const context = await contextService.getContext();
    console.log("✓ Context compiled successfully.");

    // Define prompts
    const query = "What uses FastAPI in Suraj's projects, and what is its complexity?";
    const systemPrompt = `You are the ORACLE, a professional, minimal Knowledge Officer representing Suraj Samanta.
You must answer questions about Suraj's skills, projects, and repositories using ONLY the provided context.
If details are not in the context, say "I do not have information on that in the local Knowledge Graph."

Context:
${JSON.stringify(context)}
`;

    console.log(`\n2. Querying model: ${process.env.ORACLE_MODEL || 'nvidia/nemotron-4-340b-instruct'}`);
    console.log(`User query: "${query}"`);

    const provider = new OpenRouterProvider();
    const response = await provider.generate({
      systemPrompt,
      userPrompt: query
    });

    console.log("\n✔ Response Received successfully!");
    console.log("-----------------------------------------");
    console.log(response.text);
    console.log("-----------------------------------------");
    if (response.usage) {
      console.log(`Tokens Used - Prompt: ${response.usage.promptTokens}, Completion: ${response.usage.completionTokens}, Total: ${response.usage.totalTokens}`);
    }
    
    console.log("\n=== OpenRouter Test Complete ===");
  } catch (error) {
    console.error("❌ Error during OpenRouter live integration check:", error);
  }
}

testOpenRouter();
