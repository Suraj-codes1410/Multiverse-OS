import { NextResponse } from 'next/server';
import { contextService } from '@/lib/oracle/service';
import { OpenRouterProvider } from '@/lib/oracle/openRouterProvider';
import { OracleContextSelector } from '@/lib/oracle/contextSelector';
import { DEFAULT_MODEL_CONFIG } from '@/lib/oracle/config';




export async function POST(req: Request) {

  console.log("========== ORACLE API HIT ==========");

  console.log(
    "OPENROUTER KEY EXISTS:",
    !!process.env.OPENROUTER_API_KEY
  );

  console.log(
    "MODEL:",
    process.env.ORACLE_MODEL
  );
  
  try {
    const body = await req.json().catch(() => ({}));
    const { query } = body;

    // 1. Response validation - check if query is present and correct
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ 
        error: 'VALIDATION_ERROR', 
        message: 'Query parameter is required and must be a non-empty string.' 
      }, { status: 400 });
    }

    // 2. Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        error: 'API_KEY_MISSING', 
        message: 'OpenRouter API key is not configured on the server.' 
      }, { status: 500 });
    }

    // 3. Load full portfolio context from caching service
    const fullContext = await contextService.getContext();

    // 4. Context Selection Layer - Select only relevant content
    const selected = OracleContextSelector.select(query, fullContext);

    // 5. Context Compression Layer - Format to structured readable markdown (No raw JSON)
    const compressedPromptContext = OracleContextSelector.compressAndFormat(selected);

    // 6. Diagnostics & Logging (Development-only)
    const contextSizeChars = compressedPromptContext.length;
    const estimatedTokens = Math.round(contextSizeChars / 4);
    const modelUsed = DEFAULT_MODEL_CONFIG.modelName;

    if (process.env.NODE_ENV !== 'production') {
      console.log('\n--- ORACLE CONTEXT DIAGNOSTICS ---');
      console.log(`Model: ${modelUsed}`);
      console.log(`Selected Sections: ${selected.selectedSections.join(', ')}`);
      console.log(`Entities Selected:`);
      console.log(`  Skills (${selected.skills.length}): ${selected.skills.map(s => s.name).join(', ')}`);
      console.log(`  Projects (${selected.projects.length}): ${selected.projects.map(p => p.title).join(', ')}`);
      console.log(`  Repositories (${selected.repositories.length}): ${selected.repositories.map(r => r.name).join(', ')}`);
      console.log(`  Achievements (${selected.achievements.length}): ${selected.achievements.map(a => a.title).join(', ')}`);
      console.log(`  Timeline Items: ${selected.timeline.reduce((sum, t) => sum + t.milestones.length, 0)} milestones`);
      console.log(`Context String size: ${contextSizeChars} characters`);
      console.log(`Estimated Tokens: ${estimatedTokens} tokens`);
      console.log('----------------------------------\n');
    }

    // 7. System Prompt Assembly (Readable & Curated Markdown)
    const systemPrompt = `You are the ORACLE, a professional, minimal Knowledge Officer representing Suraj Samanta.
Your purpose is to answer inquiries about Suraj's portfolio (projects, skills, repositories, achievements, experience, and technologies) as well as general technical questions.

You operate in a hybrid capacity and must classify the query into one of three modes, applying the rules for that mode:

1. PORTFOLIO MODE:
   - Applies to questions specifically about Suraj Samanta, his specific projects, skills, repositories, experience, or achievements (e.g., "Tell me about ORBITAIR", "Compare SAHAI and ORBITAIR").
   - You MUST prioritize the provided PORTFOLIO CONTEXT below.
   - Do NOT assume, guess, or hallucinate facts about Suraj, his projects, metrics, or details not found in the PORTFOLIO CONTEXT.
   - If the answer to a portfolio-specific question cannot be found or derived from the supplied context, state: "I do not have information on that in the local Knowledge Graph." and do not invent any facts.

2. GENERAL KNOWLEDGE MODE:
   - Applies to general technical questions unrelated to Suraj's portfolio (e.g., "What is React?", "What is Kafka?", "Explain Docker.", "What are microservices?", "What is Spring Boot?").
   - You MUST answer these questions using your general technical knowledge.
   - Do NOT say "I do not have information on that in the local Knowledge Graph." for these general questions. Give a direct, normal, and professional technical explanation.

3. HYBRID MODE:
   - Applies to questions that bridge Suraj's portfolio/projects and general technology (e.g., "Why did Suraj use Kafka?", "How does ORBITAIR use FastAPI?", "Explain the architecture of SAHAI.").
   - You MUST combine the provided PORTFOLIO CONTEXT (to identify which project used which technology and any implementation details) with your general technical knowledge (to explain the rationale, concepts, and architectures).
   - If the context does not explicitly state "why" Suraj made a choice, use your general technical knowledge to explain the technical benefits and rationale of that choice in the context of the project.
   - Do NOT say "I do not have information on that in the local Knowledge Graph." if you can answer using a combination of the context and general knowledge.

General Rules:
- Act as Suraj's Knowledge Officer. Be direct, professional, and clear.
- Avoid neon sci-fi gimmicks, emojis (unless highly appropriate), or ChatGPT conversational filler. Be concise and technical.
- Format your answers in clean Markdown. Use headings, bold text, lists, and code blocks where appropriate.

---
PORTFOLIO CONTEXT:
${compressedPromptContext}
---`;

    // 8. Invoke OpenRouter AI Provider
    const provider = new OpenRouterProvider();
    const response = await provider.generate({
      systemPrompt,
      userPrompt: query.trim()
    });

    // 9. Response validation - ensure output is non-empty
    if (!response.text || !response.text.trim()) {
      return NextResponse.json({ 
        error: 'EMPTY_RESPONSE_ERROR', 
        message: 'The AI provider returned an empty text completion.' 
      }, { status: 502 });
    }

    // 10. Prepare server response and optional debug metrics
    const debugInfo = process.env.NODE_ENV !== 'production' ? {
      contextSizeChars,
      estimatedTokens,
      modelUsed,
      selectedEntities: {
        skills: selected.skills.map(s => s.name),
        projects: selected.projects.map(p => p.title),
        repositories: selected.repositories.map(r => r.name),
        achievements: selected.achievements.map(a => a.title),
        sections: selected.selectedSections
      }
    } : undefined;

    return NextResponse.json({
      text: response.text,
      fresh: true,
      fallback: false,
      empty: false,
      repeated: false,
      debug: debugInfo
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate' // Prevent caching client-side
      }
    });
  } catch (error: unknown) {
    console.error('Error in Oracle API Route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error occurred.';
    return NextResponse.json({ 
      error: 'ORACLE_API_ERROR', 
      message: errorMessage,
      fallback: true
    }, { status: 500 });
  }
}
