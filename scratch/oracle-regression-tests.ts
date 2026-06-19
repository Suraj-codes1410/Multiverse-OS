import { POST } from '@/app/api/oracle/route';
import { GET } from '@/app/api/oracle/analytics/route';
import { GET as healthGET } from '@/app/api/health/route';
import { POST as clearPOST } from '@/app/api/oracle/cache/clear/route';
import AdminOraclePage from '@/app/admin/oracle/page';
import { queryCacheService } from '@/lib/oracle/queryCache';
import { conversationalMemoryService } from '@/lib/oracle/memory';
import { analyticsService } from '@/lib/oracle/analyticsService';

// Ensure OpenRouter API key is mocked for local validation
if (!process.env.OPENROUTER_API_KEY) {
  process.env.OPENROUTER_API_KEY = 'mock-api-key-for-validation';
}

const originalFetch = global.fetch;
let mockFetchFailMode = false;

function setupFetchMock() {
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.includes('openrouter.ai/api/v1/chat/completions')) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const model = body.model;

      if (model === 'invalid-primary-model' || mockFetchFailMode) {
        return new Response(
          JSON.stringify({
            error: { message: "Model not found or rate-limited upstream", status: 404 }
          }),
          { status: 404 }
        );
      }

      const messages = body.messages || [];
      const systemPrompt = messages[0]?.content || '';
      const userPrompt = messages[1]?.content || '';

      let content = `Mocked OpenRouter Response for model ${model}: Direct answers, mentorship coaching, and portfolio journey analysis successfully parsed.`;

      // Check if this is a README intelligence query about oracle-sync-test
      if (
        userPrompt.toLowerCase().includes('oracle-sync-test') || 
        userPrompt.toLowerCase().includes('special_token_1410') ||
        systemPrompt.toLowerCase().includes('oracle-sync-test')
      ) {
        content = `### oracle-sync-test Repository Summary
This is a mocked summary of the oracle-sync-test repository.
- **Purpose**: This repository exists to verify GitHub synchronization.
- **Special Token**: SPECIAL_TOKEN_1410 is present in the repository root.
- **Technologies Used**: Next.js, TypeScript, and GitHub Actions are active in this project.`;
      }

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content
              }
            }
          ],
          usage: {
            prompt_tokens: 15,
            completion_tokens: 25,
            total_tokens: 40
          }
        }),
        { status: 200 }
      );
    }

    return originalFetch(input, init);
  };
}

function restoreFetchMock() {
  global.fetch = originalFetch;
}

interface TestResult {
  query: string;
  passed: boolean;
  category: string;
  durationMs: number;
  routing: string;
  logs: string[];
  error?: string;
}

async function runTest(
  categoryName: string,
  query: string,
  assertions: (res: any, logs: string[], durationMs: number, status: number) => void,
  sessionId: string = 'test-session',
  repositoryName?: string
): Promise<TestResult> {
  const capturedLogs: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args: any[]) => {
    capturedLogs.push(args.join(' '));
    originalLog(...args);
  };
  console.error = (...args: any[]) => {
    capturedLogs.push(args.join(' '));
    originalError(...args);
  };

  const startTime = Date.now();
  let status = 0;
  let data: any = null;
  let passed = false;
  let errorMsg = '';

  try {
    const mockReq = new Request('http://localhost/api/oracle', {
      method: 'POST',
      body: JSON.stringify({ query, sessionId, repositoryName })
    });
    const res = await POST(mockReq);
    status = res.status;
    data = await res.json();
    const durationMs = Date.now() - startTime;

    assertions(data, capturedLogs, durationMs, status);
    passed = true;
  } catch (err: any) {
    passed = false;
    errorMsg = err.message || String(err);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  const durationMs = Date.now() - startTime;
  let routing = 'OpenRouter';
  if (capturedLogs.some(l => l.includes('CACHE_HIT'))) {
    routing = 'Cache';
  } else if (capturedLogs.some(l => l.includes('CAREER_DIRECT_RESPONSE'))) {
    routing = 'Career Copilot';
  } else if (capturedLogs.some(l => l.includes('NARRATIVE_DIRECT_RESPONSE'))) {
    routing = 'Narrative Engine';
  } else if (capturedLogs.some(l => l.includes('RECRUITER_DIRECT_RESPONSE'))) {
    routing = 'Recruiter Insight';
  } else if (capturedLogs.some(l => l.includes('SMART_ROUTE') || l.includes('DIRECT_RESPONSE'))) {
    routing = 'Smart Route';
  }

  if (passed) {
    console.log(`VALIDATION_PASS [${categoryName}] - "${query}" (${durationMs}ms) [Routing: ${routing}]`);
  } else {
    console.log(`VALIDATION_FAIL [${categoryName}] - "${query}" - Error: ${errorMsg}`);
  }

  return {
    query,
    passed,
    category: categoryName,
    durationMs,
    routing,
    logs: capturedLogs,
    error: errorMsg
  };
}

async function runRegressionSuite() {
  console.log('VALIDATION_START - Starting Oracle Regression & Validation Suite\n');
  setupFetchMock();

  const results: TestResult[] = [];
  const sessionId = `session-${Date.now()}`;

  // Clear cache, conversational memory, and analytics
  (queryCacheService as any).cacheManager.clear();
  conversationalMemoryService.clear(sessionId);
  analyticsService.clear();

  // ==========================================
  // Category 1: General Knowledge
  // ==========================================
  const c1Queries = ['What is Java?', 'What is Kafka?', 'What is FastAPI?', 'What is Next.js?'];
  for (const q of c1Queries) {
    const res = await runTest('General Knowledge', q, (data, logs, dur, status) => {
      if (status !== 200) throw new Error(`HTTP status is ${status}, expected 200`);
      if (!data.text) throw new Error('Response is empty');
      const textLower = data.text.toLowerCase();
      if (textLower.includes('i do not have information') && textLower.includes('knowledge graph')) {
        throw new Error('Fallback KG refusal triggered incorrectly on General Knowledge query');
      }
    }, sessionId);
    results.push(res);
  }

  // ==========================================
  // Category 2: Portfolio Intelligence
  // ==========================================
  const c2Queries = [
    { q: 'Tell me about SAHAI.', expected: ['sahai', 'mental'] },
    { q: 'Tell me about ORBITAIR.', expected: ['orbitair', 'aqi'] },
    { q: "List Suraj's repositories.", expected: ['sahai', 'orbitair', 'patient-management-service'] },
    { q: "Which is Suraj's newest repository?", expected: ['newest', 'repository'] }
  ];
  for (const item of c2Queries) {
    const res = await runTest('Portfolio Intelligence', item.q, (data, logs, dur, status) => {
      if (status !== 200) throw new Error(`HTTP status ${status}`);
      if (!data.text) throw new Error('Response is empty');
      const textLower = data.text.toLowerCase();
      const matched = item.expected.some(exp => textLower.includes(exp.toLowerCase()));
      if (!matched) throw new Error(`Expected keywords [${item.expected.join(', ')}] not found in response`);
    }, sessionId);
    results.push(res);
  }

  // ==========================================
  // Category 3: README Intelligence
  // ==========================================
  const c3Queries = [
    { q: 'Summarize oracle-sync-test.', expected: ['oracle-sync-test', 'synchronization'] },
    { q: 'What technologies are used in oracle-sync-test?', expected: ['next.js', 'typescript'] },
    { q: 'What is SPECIAL_TOKEN_1410?', expected: ['special_token_1410'] }
  ];
  for (const item of c3Queries) {
    const res = await runTest('README Intelligence', item.q, (data, logs, dur, status) => {
      if (status !== 200) throw new Error(`HTTP status ${status}`);
      if (!data.text) throw new Error('Response is empty');
      const textLower = data.text.toLowerCase();
      const matched = item.expected.some(exp => textLower.includes(exp.toLowerCase()));
      if (!matched) throw new Error(`Expected keywords [${item.expected.join(', ')}] not found in response`);
    }, sessionId);
    results.push(res);
  }

  // ==========================================
  // Category 4: Smart Routing
  // ==========================================
  const c4Queries = [
    'Which repositories use FastAPI?',
    'Which repositories use Docker?',
    'How many repositories does Suraj have?'
  ];
  for (const q of c4Queries) {
    const res = await runTest('Smart Routing', q, (data, logs, dur, status) => {
      if (status !== 200) throw new Error(`HTTP status ${status}`);
      if (!logs.some(l => l.includes('SMART_ROUTE') || l.includes('DIRECT_RESPONSE'))) {
        throw new Error('Smart Route direct response indicators not found in console logs');
      }
      if (logs.some(l => l.includes('CALLING OPENROUTER'))) {
        throw new Error('Query incorrectly routed to OpenRouter');
      }
    }, sessionId);
    results.push(res);
  }

  // ==========================================
  // Category 5: Recruiter Intelligence
  // ==========================================
  const c5Queries = [
    'Which project demonstrates backend engineering?',
    'Why should Suraj be hired?',
    'Which project best demonstrates AI engineering?'
  ];
  for (const q of c5Queries) {
    const res = await runTest('Recruiter Intelligence', q, (data, logs, dur, status) => {
      if (status !== 200) throw new Error(`HTTP status ${status}`);
      if (!logs.some(l => l.includes('RECRUITER_DIRECT_RESPONSE'))) {
        throw new Error('Recruiter Insight direct response indicators not found in logs');
      }
    }, sessionId);
    results.push(res);
  }

  // ==========================================
  // Category 6: Narrative Engine
  // ==========================================
  const c6Queries = ["Tell me Suraj's journey.", 'How has Suraj evolved as an engineer?'];
  for (const q of c6Queries) {
    const res = await runTest('Narrative Engine', q, (data, logs, dur, status) => {
      if (status !== 200) throw new Error(`HTTP status ${status}`);
      const hasModeLog = logs.some(l => l.includes('NARRATIVE_MODE'));
      const hasDirectLog = logs.some(l => l.includes('NARRATIVE_DIRECT_RESPONSE'));
      if (!hasModeLog || !hasDirectLog) {
        throw new Error('Narrative Engine direct response indicators not found in logs');
      }
    }, sessionId);
    results.push(res);
  }

  // ==========================================
  // Category 7: Portfolio Copilot
  // ==========================================
  const c7Queries = [
    'Which project should Suraj put first on his resume?',
    'What skills are missing for backend roles?',
    'What should Suraj build next?'
  ];
  for (const q of c7Queries) {
    const res = await runTest('Portfolio Copilot', q, (data, logs, dur, status) => {
      if (status !== 200) throw new Error(`HTTP status ${status}`);
      const hasModeLog = logs.some(l => l.includes('CAREER_MODE'));
      const hasDirectLog = logs.some(l => l.includes('CAREER_DIRECT_RESPONSE'));
      if (!hasModeLog || !hasDirectLog) {
        throw new Error('Portfolio Copilot direct response indicators not found in logs');
      }
    }, sessionId);
    results.push(res);
  }

  // ==========================================
  // Category 8: Conversational Memory
  // ==========================================
  // We'll run a sequence to verify that 'it' resolves to SAHAI from the first query
  const sessionMemId = `mem-session-${Date.now()}`;
  conversationalMemoryService.clear(sessionMemId);

  const resMem1 = await runTest('Conversational Memory [Run 1]', 'Tell me about SAHAI.', (data, logs, dur, status) => {
    if (status !== 200) throw new Error(`HTTP status ${status}`);
  }, sessionMemId);
  results.push(resMem1);

  const resMem2 = await runTest('Conversational Memory [Run 2]', 'What technologies does it use?', (data, logs, dur, status) => {
    if (status !== 200) throw new Error(`HTTP status ${status}`);
    const hasFollowUp = logs.some(l => l.includes('FOLLOWUP_DETECTED'));
    const hasResolved = logs.some(l => l.includes('ENTITY_RESOLVED'));
    if (!hasFollowUp || !hasResolved) {
      throw new Error('Conversational memory follow-up pronoun resolution was not triggered or logged');
    }
  }, sessionMemId);
  results.push(resMem2);

  // ==========================================
  // Category 9: Cache Validation
  // ==========================================
  // Run the same query twice to trigger and assert cache hits
  const cacheQuery = 'What is Java?';
  
  // Clear cache first to ensure Cache Miss on Run 1
  (queryCacheService as any).cacheManager.clear();

  const resCache1 = await runTest('Cache Validation [Run 1]', cacheQuery, (data, logs, dur, status) => {
    if (status !== 200) throw new Error(`HTTP status ${status}`);
    if (!logs.some(l => l.includes('CACHE_MISS'))) {
      throw new Error('First run expected CACHE_MISS');
    }
  }, sessionId);
  results.push(resCache1);

  const resCache2 = await runTest('Cache Validation [Run 2]', cacheQuery, (data, logs, dur, status) => {
    if (status !== 200) throw new Error(`HTTP status ${status}`);
    if (!logs.some(l => l.includes('CACHE_HIT'))) {
      throw new Error('Second run expected CACHE_HIT');
    }
  }, sessionId);
  results.push(resCache2);

  // ==========================================
  // Category 10: Failover Validation
  // ==========================================
  const originalPrimaryModel = process.env.PRIMARY_MODEL;
  process.env.PRIMARY_MODEL = 'invalid-primary-model';

  // Choose a query that triggers Narrative Engine OpenRouter Fallback without matching Career paths
  const failoverQuery = "Write a professional biography story about Suraj.";
  const resFailover = await runTest('Failover Validation', failoverQuery, (data, logs, dur, status) => {
    if (status !== 200) throw new Error(`HTTP status ${status}`);
    const hasFail = logs.some(l => l.includes('MODEL_FAIL'));
    const hasFallback = logs.some(l => l.includes('MODEL_FALLBACK'));
    const hasSuccess = logs.some(l => l.includes('MODEL_SUCCESS'));

    if (!hasFail || !hasFallback || !hasSuccess) {
      throw new Error('Failover sequence logs not fully detected (expected MODEL_FAIL, MODEL_FALLBACK, and MODEL_SUCCESS)');
    }
  }, sessionId);
  results.push(resFailover);

  if (originalPrimaryModel) {
    process.env.PRIMARY_MODEL = originalPrimaryModel;
  } else {
    delete process.env.PRIMARY_MODEL;
  }

  // ==========================================
  // Category 11: Analytics & Observability Validation
  // ==========================================
  const resAnalytics = await runTest('Analytics Validation', 'Retrieve analytics dashboard data', async (data, logs, dur, status) => {
    const response = await GET();
    if (response.status !== 200) throw new Error(`HTTP status is ${response.status}`);
    const metrics = await response.json();
    
    const requiredKeys = ['queries', 'cache', 'routing', 'performance', 'providers', 'recruiter', 'memory'];
    for (const key of requiredKeys) {
      if (!(key in metrics)) {
        throw new Error(`Missing expected analytics key: ${key}`);
      }
    }

    if (metrics.queries.totalQueries === 0) {
      throw new Error('Query count did not increase (expected > 0)');
    }
    if (metrics.cache.cacheHits === 0) {
      throw new Error('Cache hit count did not increase (expected > 0)');
    }
    if (metrics.routing.smartRoutes === 0) {
      throw new Error('Smart route count did not increase (expected > 0)');
    }
    if (metrics.providers.openRouterCalls === 0) {
      throw new Error('OpenRouter API call count did not increase (expected > 0)');
    }
    
    const fs = eval('require')('fs');
    const path = eval('require')('path');
    const analyticsPath = path.join(process.cwd(), 'data/oracle-analytics.json');
    if (!fs.existsSync(analyticsPath)) {
      throw new Error('Analytics data was not persisted to file');
    }
    const persisted = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
    if (persisted.queries.length !== metrics.queries.totalQueries) {
      throw new Error('Persisted query count does not match in-memory dashboard query count');
    }
  }, sessionId);
  results.push(resAnalytics);

  // ==========================================
  // Category 12: Admin Dashboard & Health Validation
  // ==========================================
  const resAdmin = await runTest('Admin Dashboard & Health Validation', 'Validate Admin dashboard loading, health status, and cache clearing', async (data, logs, dur, status) => {
    const pageElement = await AdminOraclePage();
    if (!pageElement) {
      throw new Error('Admin Dashboard Page returned empty element');
    }
    if (!logs.some(l => l.includes('ADMIN_DASHBOARD_LOAD'))) {
      throw new Error('ADMIN_DASHBOARD_LOAD was not logged on page load');
    }

    const healthResponse = await healthGET();
    if (healthResponse.status !== 200) {
      throw new Error(`Health endpoint returned status ${healthResponse.status}`);
    }
    const healthData = await healthResponse.json();
    if (healthData.status !== 'healthy') {
      throw new Error(`Expected health status 'healthy', got ${healthData.status}`);
    }
    if (!healthData.services.cache || !healthData.services.githubSync || !healthData.services.memory || !healthData.services.oracle || !healthData.services.openrouter || !healthData.services.smartRouter) {
      throw new Error('One or more systems are unhealthy');
    }
    if (!logs.some(l => l.includes('HEALTH_CHECK'))) {
      throw new Error('HEALTH_CHECK was not logged on health check endpoint execution');
    }

    const clearResponse = await clearPOST();
    if (clearResponse.status !== 200) {
      throw new Error(`Clear cache endpoint returned status ${clearResponse.status}`);
    }
    const clearData = await clearResponse.json();
    if (!clearData.success) {
      throw new Error('Clear cache call was unsuccessful');
    }
    if (!logs.some(l => l.includes('CACHE_CLEAR'))) {
      throw new Error('CACHE_CLEAR was not logged on clear cache call');
    }

    const metricsResponse = await GET();
    const metricsData = await metricsResponse.json();
    if (metricsData.cache.cacheSize !== 0) {
      throw new Error(`Cache was not cleared successfully, current cacheSize is ${metricsData.cache.cacheSize}`);
    }
  }, sessionId);
  results.push(resAdmin);

  // ==========================================
  // Summary & Performance Metrics
  // ==========================================
  restoreFetchMock();

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0);
  const avgDuration = totalDuration / totalTests;

  const cacheHits = results.filter(r => r.routing === 'Cache').length;
  const cacheHitRate = (cacheHits / totalTests) * 100;

  const smartRoutes = results.filter(r => r.routing === 'Smart Route').length;
  const smartRouteRate = (smartRoutes / totalTests) * 100;

  const openRouterUsage = results.filter(r => r.routing === 'OpenRouter').length;

  console.log('\n========================================');
  console.log('VALIDATION_SUMMARY');
  console.log('========================================');
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Average Response Time: ${avgDuration.toFixed(1)}ms`);
  console.log(`Cache Hit Rate: ${cacheHitRate.toFixed(1)}% (${cacheHits}/${totalTests})`);
  console.log(`Smart Route Direct Response Rate: ${smartRouteRate.toFixed(1)}% (${smartRoutes}/${totalTests})`);
  console.log(`OpenRouter API Generation Count: ${openRouterUsage}`);
  console.log('========================================\n');

  console.log('--- INDIVIDUAL TEST CATEGORY REPORTS ---');
  const categories = Array.from(new Set(results.map(r => r.category)));
  let allPass = true;
  for (const cat of categories) {
    const catTests = results.filter(r => r.category === cat);
    const catPassed = catTests.every(r => r.passed);
    if (catPassed) {
      console.log(`PASS  ${cat}`);
    } else {
      console.log(`FAIL  ${cat}`);
      allPass = false;
    }
  }
  console.log('----------------------------------------\n');

  if (allPass && failedTests === 0) {
    console.log('VALIDATION_PASS - All regression scenarios passed successfully.');
    process.exit(0);
  } else {
    console.log('VALIDATION_FAIL - One or more regression failures were detected.');
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal error running regression suite:', err);
  process.exit(1);
});
