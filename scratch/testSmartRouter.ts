import { SmartRouter } from '@/lib/oracle/smartRouter';
import { getRepositories } from '@/lib/github/github';
import { getProjects } from '@/lib/content/index';
import { QueryIntentClassifier } from '@/lib/oracle/smartRouter';

async function testQuery(query: string, expectedRoute: 'SMART_ROUTE' | 'MODEL_ROUTE') {
  console.log(`\n========================================`);
  console.log(`TEST QUERY: "${query}"`);
  console.log(`========================================`);

  const repositories = await getRepositories();
  const projects = await getProjects();

  const classification = QueryIntentClassifier.classify(query, repositories, projects);
  console.log(`[Classifier] Category: ${classification.category} | Confidence: ${classification.confidence}`);
  console.log(`[Classifier] Extracted Repos: ${classification.extractedEntities.repositories.join(', ') || 'none'}`);
  console.log(`[Classifier] Extracted Techs: ${classification.extractedEntities.technologies.join(', ') || 'none'}`);

  // Capture console.log outputs during routing
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  try {
    const result = await SmartRouter.route(query);
    
    // Restore console.log
    console.log = originalLog;

    console.log(`\n[Result] Direct Answer Available: ${result.directAnswerAvailable}`);
    if (result.directAnswerAvailable) {
      console.log(`[Result] Direct Answer Preview:\n${result.directResponse?.split('\n').slice(0, 3).join('\n')}\n...`);
    }

    // Verify expectations
    const smartRouteLogged = logs.includes('SMART_ROUTE');
    const modelRouteLogged = logs.includes('MODEL_ROUTE');

    if (expectedRoute === 'SMART_ROUTE') {
      if (smartRouteLogged && result.directAnswerAvailable) {
        console.log(`✅ SUCCESS: Correctly routed locally to SMART_ROUTE!`);
      } else {
        console.log(`❌ FAILURE: Expected SMART_ROUTE, got directAnswerAvailable=${result.directAnswerAvailable}, logs=${logs.join(', ')}`);
      }
    } else {
      if (modelRouteLogged && !result.directAnswerAvailable) {
        console.log(`✅ SUCCESS: Correctly routed to MODEL_ROUTE (OpenRouter)!`);
      } else {
        console.log(`❌ FAILURE: Expected MODEL_ROUTE, got directAnswerAvailable=${result.directAnswerAvailable}, logs=${logs.join(', ')}`);
      }
    }
  } catch (error) {
    console.log = originalLog;
    console.error(`❌ ERROR executing route:`, error);
  }
}

async function runAllTests() {
  console.log("Starting Smart Query Routing Validation Tests...\n");

  // Test 1: Newest Repository (Expected: SMART_ROUTE)
  await testQuery("Which is Suraj's newest repository?", "SMART_ROUTE");

  // Test 2: Technology Lookup (Expected: SMART_ROUTE)
  await testQuery("Which repositories use FastAPI?", "SMART_ROUTE");

  // Test 3: Portfolio Statistics (Expected: SMART_ROUTE)
  await testQuery("How many repositories does Suraj have?", "SMART_ROUTE");

  // Test 4: General Knowledge (Expected: MODEL_ROUTE)
  await testQuery("What is Java?", "MODEL_ROUTE");

  // Test 5: Comparison/General synthesis (Expected: MODEL_ROUTE)
  await testQuery("Compare SAHAI and ORBITAIR.", "MODEL_ROUTE");

  console.log("\n========================================");
  console.log("All validation tests complete!");
  console.log("========================================\n");
}

runAllTests().catch(console.error);
