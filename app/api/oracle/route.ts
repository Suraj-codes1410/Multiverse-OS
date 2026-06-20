import { NextResponse } from 'next/server';
import { contextService } from '@/lib/oracle/service';
import { ProviderFactory } from '@/lib/oracle/providerFactory';
import { OracleContextSelector } from '@/lib/oracle/contextSelector';
import { DEFAULT_MODEL_CONFIG } from '@/lib/oracle/config';
import { RepositoryRefreshManager } from '@/lib/github/syncService';
import { RecruiterInsightEngine } from '@/lib/github/recruiterInsightEngine';
import { queryCacheService } from '@/lib/oracle/queryCache';
import { SmartRouter, QueryIntentClassifier } from '@/lib/oracle/smartRouter';
import { conversationalMemoryService } from '@/lib/oracle/memory';
import { PortfolioNarrativeEngine } from '@/lib/oracle/narrativeEngine';
import { PortfolioCopilotEngine } from '@/lib/oracle/copilotEngine';
import { analyticsService } from '@/lib/oracle/analyticsService';
import { getRepositories } from '@/lib/github/github';
import { getProjects } from '@/lib/content/index';
import { initializeOracleStartup } from '@/lib/oracle/startup';

// Execute Startup Validation and error recoveries
initializeOracleStartup();

// Dedicated sync route manages synchronization on Vercel.
// Do not start RepositoryRefreshManager at top-level startup to prevent serverless execution timeout.


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

  const startTime = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const { query, repositoryName, sessionId = 'default-session', eventType } = body;

    if (eventType === 'PUBLIC_LAUNCH_VIEW') {
      console.log("PUBLIC_LAUNCH_VIEW");
      return NextResponse.json({ success: true, event: 'PUBLIC_LAUNCH_VIEW' });
    }
    if (eventType === 'SUGGESTED_QUERY_CLICK') {
      console.log("SUGGESTED_QUERY_CLICK", query);
    }
    if (eventType === 'RECRUITER_MODE_CLICK') {
      console.log("RECRUITER_MODE_CLICK", query);
    }

    // 1. Response validation - check if query is present and correct
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ 
        error: 'VALIDATION_ERROR', 
        message: 'Query parameter is required and must be a non-empty string.' 
      }, { status: 400 });
    }

    // 1.5. Resolve pronouns in query using conversational memory
    const { resolvedQuery, hit: resolvedMemory } = conversationalMemoryService.resolve(sessionId, query);
    const queryToUse = resolvedQuery;
    const contextReused = conversationalMemoryService.getSession(sessionId).interactions.length > 0;

    // 2. Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        error: 'API_KEY_MISSING', 
        message: 'OpenRouter API key is not configured on the server.' 
      }, { status: 500 });
    }

    // 2.5. Query Cache Lookup
    const cacheKey = repositoryName ? `${queryToUse.trim()}::repo:${repositoryName}` : queryToUse.trim();
    const cachedResponse = queryCacheService.get(cacheKey);
    if (cachedResponse) {
      await conversationalMemoryService.store(sessionId, queryToUse, cachedResponse);

      // Determine category and route for cached query
      const cachedRepos = await getRepositories().catch(() => []);
      const cachedProjs = await getProjects().catch(() => []);
      const classification = QueryIntentClassifier.classify(queryToUse, cachedRepos, cachedProjs);
      
      const cacheEntry = (queryCacheService as any).cacheManager.get(queryCacheService.normalize(cacheKey));
      const source = cacheEntry?.source || 'openrouter';
      
      const routeName = source === 'narrative-engine' ? 'narrative-engine' 
                : source === 'copilot-engine' ? 'copilot-engine'
                : source === 'smart-route' ? 'smart-route'
                : source === 'recruiter-insight' ? 'recruiter-insight'
                : 'openrouter';

      analyticsService.recordQuery({
        query,
        normalizedQuery: queryCacheService.normalize(queryToUse),
        latencyMs: Date.now() - startTime,
        cacheHit: true,
        route: routeName,
        category: classification.category,
        directAnswer: routeName !== 'openrouter',
        resolvedMemory,
        contextReused
      });

      return NextResponse.json({
        text: cachedResponse,
        fresh: false,
        fallback: false,
        empty: false,
        repeated: true,
        debug: {
          cacheHit: true,
          cacheKey
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      });
    }

    // 2.6. Portfolio Narrative Engine Layer
    const narrativeResult = await PortfolioNarrativeEngine.generate(queryToUse);
    if (narrativeResult.directAnswerAvailable && narrativeResult.directResponse) {
      // Store in query cache (using 'narrative-engine' as the model)
      queryCacheService.set(cacheKey, narrativeResult.directResponse, 'narrative-engine');
      await conversationalMemoryService.store(sessionId, queryToUse, narrativeResult.directResponse);

      analyticsService.recordQuery({
        query,
        normalizedQuery: queryCacheService.normalize(queryToUse),
        latencyMs: Date.now() - startTime,
        cacheHit: false,
        route: 'narrative-engine',
        category: 'Narrative',
        directAnswer: true,
        resolvedMemory,
        contextReused
      });

      return NextResponse.json({
        text: narrativeResult.directResponse,
        fresh: true,
        fallback: false,
        empty: false,
        repeated: false,
        debug: {
          narrativeEngine: true,
          mode: narrativeResult.mode
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      });
    }

    // 2.6.5. Portfolio Copilot & Career Advisor Layer
    const copilotResult = await PortfolioCopilotEngine.evaluate(queryToUse);
    if (copilotResult.directAnswerAvailable && copilotResult.directResponse) {
      // Store in query cache (using 'copilot-engine' as the model)
      queryCacheService.set(cacheKey, copilotResult.directResponse, 'copilot-engine');
      await conversationalMemoryService.store(sessionId, queryToUse, copilotResult.directResponse);

      analyticsService.recordQuery({
        query,
        normalizedQuery: queryCacheService.normalize(queryToUse),
        latencyMs: Date.now() - startTime,
        cacheHit: false,
        route: 'copilot-engine',
        category: 'Portfolio Copilot',
        directAnswer: true,
        resolvedMemory,
        contextReused
      });

      return NextResponse.json({
        text: copilotResult.directResponse,
        fresh: true,
        fallback: false,
        empty: false,
        repeated: false,
        debug: {
          copilotEngine: true,
          category: copilotResult.category
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      });
    }

    // 2.7. Smart Query Routing Layer
    const routeResult = await SmartRouter.route(queryToUse, repositoryName);
    if (routeResult.directAnswerAvailable && routeResult.directResponse) {
      // Store in query cache
      const finalSource = routeResult.category === 'Recruiter Insight' ? 'recruiter-insight' : 'smart-route';
      queryCacheService.set(cacheKey, routeResult.directResponse, finalSource);
      await conversationalMemoryService.store(sessionId, queryToUse, routeResult.directResponse);

      analyticsService.recordQuery({
        query,
        normalizedQuery: queryCacheService.normalize(queryToUse),
        latencyMs: Date.now() - startTime,
        cacheHit: false,
        route: finalSource,
        category: routeResult.category,
        directAnswer: true,
        resolvedMemory,
        contextReused
      });

      return NextResponse.json({
        text: routeResult.directResponse,
        fresh: true,
        fallback: false,
        empty: false,
        repeated: false,
        debug: {
          smartRouted: true,
          category: routeResult.category
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      });
    }

    // 3. Load full portfolio context from caching service
    const fullContext = await contextService.getContext();

    // 4. Context Selection Layer - Select only relevant content
    const selected = await OracleContextSelector.select(queryToUse, fullContext);

    // 5. Context Compression Layer - Format to structured readable markdown (No raw JSON)
    let compressedPromptContext = OracleContextSelector.compressAndFormat(selected);

    // Add repository creation dates for recency queries (Phase 4.6 additive functionality)
    if (selected.repositories && selected.repositories.length > 0) {
      compressedPromptContext += `\n\n### REPOSITORY TIMESTAMPS\n`;
      selected.repositories.forEach(r => {
        compressedPromptContext += `- Repository: ${r.name} | Created: ${r.createdAt} | Last Updated: ${r.updatedAt}\n`;
      });
    }

    // Dynamic Recruiter Insights Integration (Phase 4.7B)
    const recruiterInsight = await RecruiterInsightEngine.evaluateQuery(queryToUse);
    if (recruiterInsight) {
      compressedPromptContext += `\n\n### RECRUITER INSIGHT RECOMMENDATIONS (RANKED EVIDENCE-BACKED)
Matching Dimension: ${recruiterInsight.bestDimensionMatched}
We have run a deterministic ProjectRankingService across projects. Here are the ranked results:
`;
      recruiterInsight.rankings.forEach(rank => {
        compressedPromptContext += `- Rank ${rank.rank}: **${rank.projectTitle}** (Score: ${rank.score}/100)
  * Project Reference: ${rank.projectId}
  * Repository Reference: ${rank.repositoryName} | Link: ${rank.repositoryUrl}
  * Technologies Used: ${rank.technologies.join(', ')}
  * Evidence: ${rank.evidence.join(', ')}
  * Rationale: ${rank.rationale}
`;
      });
    }

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
Your purpose is to answer inquiries about Suraj's projects, skills, repositories, achievements, experience, and technologies, as well as general technical questions.

You must strictly adhere to the following rules:
1. Act as Suraj's Knowledge Officer. Be direct, professional, and clear.
2. Use supplied context whenever relevant.
   - For general questions unrelated to Suraj's portfolio, answer using model knowledge.
   - For portfolio questions, prioritize supplied context and do not invent portfolio facts.
3. Apply the appropriate response mode based on the query:
   - PORTFOLIO MODE: For questions about Suraj, his projects, skills, repositories, experience, or achievements, use the supplied PORTFOLIO CONTEXT as the primary source. If a specific portfolio fact cannot be found or derived from the context, state: "I do not have information on that in the local Knowledge Graph." and do not invent facts.
   - GENERAL KNOWLEDGE MODE: For general technical questions (e.g., "What is Kafka?", "What is React?", "What is Next.js?", "What is Docker?", "What is Spring Boot?", "What is FastAPI?"), use your model knowledge normally. Do NOT refuse them or output the "local Knowledge Graph" refusal.
   - HYBRID MODE: For questions bridging Suraj's portfolio and general concepts (e.g., "Why did Suraj use Kafka?", "How does ORBITAIR use FastAPI?"), combine the supplied PORTFOLIO CONTEXT with your model knowledge to provide an evidence-backed rationale.
4. Avoid neon sci-fi gimmicks, emojis (unless highly appropriate), or ChatGPT conversational filler. Be concise and technical.
5. Format your answers in clean Markdown. Use headings, bold text, lists, and code blocks where appropriate.

---
PORTFOLIO CONTEXT:
${compressedPromptContext}
---`;

    // 8. Invoke Active AI Provider
    const provider = ProviderFactory.create();

    console.log("CALLING OPENROUTER");
    console.log("Query:", queryToUse.trim());
    if (repositoryName) {
      console.log("Repository Context Name:", repositoryName);
    }

    const userPrompt = repositoryName 
      ? `[Context: The user is currently viewing the repository page for "${repositoryName}". "This repository" refers to "${repositoryName}".]\n\nQuery: ${queryToUse.trim()}`
      : queryToUse.trim();

    const response = await provider.generate({
      systemPrompt,
      userPrompt
    });

    console.log("ROUTE_OPENROUTER");
    console.log("OPENROUTER SUCCESS");
    console.log("AI RESPONSE:");
    console.log(response.text);

    // 9. Response validation - ensure output is non-empty
    if (!response.text || !response.text.trim()) {
      return NextResponse.json({ 
        error: 'EMPTY_RESPONSE_ERROR', 
        message: 'The AI provider returned an empty text completion.' 
      }, { status: 502 });
    }

    // Store in query cache
    const cachedModelUsed = response.usage?.modelUsed || process.env.PRIMARY_MODEL || 'deepseek/deepseek-r1:free';
    queryCacheService.set(cacheKey, response.text, cachedModelUsed);

    // Store in conversational memory
    await conversationalMemoryService.store(sessionId, queryToUse, response.text);

    // Determine category
    const finalRepos = await getRepositories().catch(() => []);
    const finalProjs = await getProjects().catch(() => []);
    const classification = QueryIntentClassifier.classify(queryToUse, finalRepos, finalProjs);

    // Record successful query to analytics
    analyticsService.recordQuery({
      query,
      normalizedQuery: queryCacheService.normalize(queryToUse),
      latencyMs: Date.now() - startTime,
      cacheHit: false,
      route: 'openrouter',
      category: classification.category,
      directAnswer: false,
      resolvedMemory,
      contextReused
    });

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
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error: unknown) {
    console.log("ROUTE_FALLBACK");
    console.error('Error in Oracle API Route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error occurred.';
    return NextResponse.json({ 
      error: 'ORACLE_API_ERROR', 
      message: errorMessage,
      fallback: true
    }, { status: 500 });
  }
}
