import { PortfolioNarrativeEngine } from '@/lib/oracle/narrativeEngine';

async function testNarrativeQuery(query: string, expectedLog: 'NARRATIVE_DIRECT_RESPONSE' | 'NARRATIVE_MODEL_ROUTE') {
  console.log(`\n========================================`);
  console.log(`TEST QUERY: "${query}"`);
  console.log(`========================================`);

  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  try {
    const result = await PortfolioNarrativeEngine.generate(query);
    
    console.log = originalLog;

    console.log(`\nDirect Answer Available: ${result.directAnswerAvailable}`);
    console.log(`Narrative Mode: ${result.mode}`);
    if (result.directAnswerAvailable && result.directResponse) {
      console.log(`Response Preview:\n${result.directResponse.split('\n').slice(0, 5).join('\n')}\n...`);
    }

    const logMatched = logs.some(l => l.includes(expectedLog));
    console.log(`Expected Log [${expectedLog}] Found: ${logMatched}`);

    // Verify sub-analyses logging categories when direct response is active
    if (expectedLog === 'NARRATIVE_DIRECT_RESPONSE') {
      const modeLogged = logs.some(l => l.includes('NARRATIVE_MODE'));
      const journeyLogged = logs.some(l => l.includes('JOURNEY_ANALYSIS'));
      const strengthLogged = logs.some(l => l.includes('STRENGTH_ANALYSIS'));
      const evolutionLogged = logs.some(l => l.includes('EVOLUTION_ANALYSIS'));

      console.log(`Additional Checks - NARRATIVE_MODE: ${modeLogged} | JOURNEY_ANALYSIS: ${journeyLogged} | STRENGTH_ANALYSIS: ${strengthLogged} | EVOLUTION_ANALYSIS: ${evolutionLogged}`);

      if (logMatched && result.directAnswerAvailable && modeLogged && journeyLogged && strengthLogged && evolutionLogged) {
        console.log(`✅ SUCCESS: Narrative routing & analysis checks matched!`);
        return true;
      }
    } else {
      if (logMatched && !result.directAnswerAvailable) {
        console.log(`✅ SUCCESS: Fallback to OpenRouter narrative synthesis matched!`);
        return true;
      }
    }

    console.log(`❌ FAILURE: Routing/checks mismatch.`);
    return false;
  } catch (error) {
    console.log = originalLog;
    console.error("❌ ERROR running narrative test:", error);
    return false;
  }
}

async function runAllNarrativeTests() {
  console.log("Starting Portfolio Narrative Engine Verification Tests...\n");

  let allPassed = true;

  // Test 1: Journey narrative
  const t1 = await testNarrativeQuery("Tell me Suraj's journey.", "NARRATIVE_DIRECT_RESPONSE");
  if (!t1) allPassed = false;

  // Test 2: Growth narrative
  const t2 = await testNarrativeQuery("How has Suraj evolved as an engineer?", "NARRATIVE_DIRECT_RESPONSE");
  if (!t2) allPassed = false;

  // Test 3: Strengths/Weaknesses assessment
  const t3 = await testNarrativeQuery("What are Suraj's strengths and weaknesses?", "NARRATIVE_DIRECT_RESPONSE");
  if (!t3) allPassed = false;

  // Test 4: Career positioning
  const t4 = await testNarrativeQuery("What type of engineer is Suraj becoming?", "NARRATIVE_DIRECT_RESPONSE");
  if (!t4) allPassed = false;

  // Test 5: Professional biography fallback
  const t5 = await testNarrativeQuery("Write a professional biography for Suraj's engineering career.", "NARRATIVE_MODEL_ROUTE");
  if (!t5) allPassed = false;

  console.log("\n========================================");
  if (allPassed) {
    console.log("🎉 ALL NARRATIVE ENGINE TESTS PASSED! 🎉");
  } else {
    console.log("🔴 SOME NARRATIVE ENGINE TESTS FAILED! 🔴");
  }
  console.log("========================================\n");
}

runAllNarrativeTests().catch(console.error);
