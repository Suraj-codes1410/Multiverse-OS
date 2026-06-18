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

if (!process.env.ORACLE_MODEL) {
  process.env.ORACLE_MODEL = 'openrouter/free';
}

const queries = [
  "What is Java?",
  "Compare SAHAI and ORBITAIR.",
  "Which project demonstrates backend engineering?",
  "Which is Suraj's newest project?",
  "Why did Suraj use Kafka?"
];

async function runValidation() {
  console.log("====================================================");
  console.log("STARTING LIVE GITHUB SYNC & ORACLE VALIDATION RUN");
  console.log("====================================================");
  console.log("OPENROUTER KEY EXISTS:", !!process.env.OPENROUTER_API_KEY);
  console.log("CONFIGURED MODEL:", process.env.ORACLE_MODEL);

  // Dynamic imports to prevent static initialization issues during hoisting
  const { GitHubSyncService, getSyncDiagnostics } = await import('../lib/github/syncService');
  const { OpenRouterProvider } = await import('../lib/oracle/openRouterProvider');
  const { contextService } = await import('../lib/oracle/service');
  const { OracleContextSelector } = await import('../lib/oracle/contextSelector');

  // 1. Execute Sync
  console.log("\n--- Executing Sync Service ---");
  const syncService = new GitHubSyncService();
  await syncService.sync();

  // 2. Fetch Diagnostics
  const diagnostics = getSyncDiagnostics();
  console.log("\n--- Sync Diagnostics ---");
  console.log(`Sync Status:             ${diagnostics.status}`);
  console.log(`Last Refresh Time:       ${diagnostics.lastRefreshTime}`);
  console.log(`Repositories Synced:     ${diagnostics.repositoriesSynced}`);
  console.log(`New Repositories Found:  ${diagnostics.newRepositoriesFound}`);
  if (diagnostics.error) {
    console.log(`Sync Error (Isolated):   ${diagnostics.error}`);
  }

  // 3. Execute Queries
  const fullContext = await contextService.getContext();
  const provider = new OpenRouterProvider();

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    if (i > 0) {
      console.log(`\nWaiting 8 seconds to avoid rate limits...`);
      await new Promise(resolve => setTimeout(resolve, 8000));
    }
    console.log(`\n----------------------------------------------------`);
    console.log(`QUERY: "${query}"`);
    console.log(`----------------------------------------------------`);

    try {
      // a. Selection Layer
      const selected = await OracleContextSelector.select(query, fullContext);
      
      // b. Format / Compression
      let compressedPromptContext = OracleContextSelector.compressAndFormat(selected);

      // Add repository timestamps additively for recency queries
      if (selected.repositories && selected.repositories.length > 0) {
        compressedPromptContext += `\n\n### REPOSITORY TIMESTAMPS\n`;
        selected.repositories.forEach(r => {
          compressedPromptContext += `- Repository: ${r.name} | Created: ${r.createdAt} | Last Updated: ${r.updatedAt}\n`;
        });
      }

      // c. System Prompt
      const systemPrompt = `You are the ORACLE, a professional, minimal Knowledge Officer representing Suraj Samanta.
Your purpose is to answer inquiries about Suraj's projects, skills, repositories, achievements, experience, and technologies, as well as general technical questions.

You must strictly adhere to the following rules:
1. Act as Suraj's Knowledge Officer. Be direct, professional, and clear.
2. Use supplied context whenever relevant.
   - For general questions unrelated to Suraj's portfolio, answer using model knowledge.
   - For portfolio questions, prioritize supplied context and do not invent portfolio facts.
3. Apply the appropriate response mode based on the query:
   - PORTFOLIO MODE: For questions about Suraj, his projects, skills, repositories, experience, or achievements, use the supplied PORTFOLIO CONTEXT as the primary source. If a specific portfolio fact cannot be found or derived from the context, state: "I do not have information on that in the local Knowledge Graph." and do not invent facts.
   - GENERAL KNOWLEDGE MODE: For general technical questions, use your model knowledge normally.
   - HYBRID MODE: For questions bridging Suraj's portfolio and general concepts, combine the supplied PORTFOLIO CONTEXT with your model knowledge to provide an evidence-backed rationale.
4. Avoid neon sci-fi gimmicks, emojis (unless highly appropriate), or ChatGPT conversational filler. Be concise and technical.
5. Format your answers in clean Markdown. Use headings, bold text, lists, and code blocks where appropriate.

---
PORTFOLIO CONTEXT:
${compressedPromptContext}
---`;

      console.log("ROUTE_OPENROUTER");
      const response = await provider.generate({
        systemPrompt,
        userPrompt: query.trim()
      });

      console.log("STATUS: SUCCESS");
      console.log("AI RESPONSE:");
      console.log(response.text.trim());
    } catch (err: any) {
      console.log("ROUTE_FALLBACK");
      console.error("STATUS: ERROR / FALLBACK TRIGGERED");
      console.error(err.message || err);
    }
  }
  console.log("\n====================================================");
  console.log("VALIDATION RUN COMPLETED");
  console.log("====================================================");
}

runValidation();
