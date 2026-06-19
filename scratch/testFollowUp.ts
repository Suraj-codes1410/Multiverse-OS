import { conversationalMemoryService } from '@/lib/oracle/memory';

async function testScenario(
  scenarioName: string,
  interactions: { query: string; response: string }[],
  followUpQuery: string,
  expectedKeyword: string
) {
  console.log(`\n========================================`);
  console.log(`SCENARIO: ${scenarioName}`);
  console.log(`========================================`);

  const sessionId = `scenario-session-${scenarioName.replace(/\s+/g, '-')}`;
  conversationalMemoryService.clear(sessionId);

  // Capture console logs to verify formatting
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  try {
    // 1. Populate previous interactions
    for (const inter of interactions) {
      await conversationalMemoryService.store(sessionId, inter.query, inter.response);
    }

    console.log(`\nFollow-Up Query: "${followUpQuery}"`);

    // 2. Resolve follow-up
    const resolution = conversationalMemoryService.resolve(sessionId, followUpQuery);

    // Restore logs
    console.log = originalLog;

    console.log(`\nResolved Query: "${resolution.resolvedQuery}"`);
    console.log(`Resolution Hit: ${resolution.hit}`);
    console.log(`Resolved Entities: ${resolution.resolvedEntities.join(', ') || 'none'}`);

    // Verify logs
    const detectedLogged = logs.some(l => l.includes('FOLLOWUP_DETECTED'));
    const resolvedLogged = logs.some(l => l.includes('ENTITY_RESOLVED'));
    const memoryUsedLogged = logs.some(l => l.includes('MEMORY_CONTEXT_USED'));

    console.log(`\n--- Verification Metrics ---`);
    console.log(`Log 'FOLLOWUP_DETECTED' present: ${detectedLogged}`);
    console.log(`Log 'ENTITY_RESOLVED' present: ${resolvedLogged}`);
    console.log(`Log 'MEMORY_CONTEXT_USED' present: ${memoryUsedLogged}`);

    let passed = true;
    if (!resolution.hit) {
      console.log(`❌ FAILED: Pronoun resolution did not hit.`);
      passed = false;
    }
    if (!resolution.resolvedQuery.toLowerCase().includes(expectedKeyword.toLowerCase())) {
      console.log(`❌ FAILED: Resolved query did not contain expected keyword "${expectedKeyword}".`);
      passed = false;
    }
    if (!detectedLogged || !resolvedLogged || !memoryUsedLogged) {
      console.log(`❌ FAILED: Required log statements were not printed.`);
      passed = false;
    }

    if (passed) {
      console.log(`\n✅ SCENARIO PASSED!`);
      return true;
    } else {
      console.log(`\n❌ SCENARIO FAILED!`);
      return false;
    }
  } catch (error) {
    console.log = originalLog;
    console.error("❌ ERROR running scenario:", error);
    return false;
  }
}

async function runAllScenarios() {
  console.log("Starting Phase 5.2 Follow-Up Question Intelligence Scenarios...\n");

  let allPassed = true;

  // Test 1: Project Follow-Up
  const t1 = await testScenario(
    "Project Follow-Up",
    [{ query: "Tell me about SAHAI", response: "SAHAI is a Mental Health Platform." }],
    "What technologies does it use?",
    "SAHAI"
  );
  if (!t1) allPassed = false;

  // Test 2: Comparison Follow-Up
  const t2 = await testScenario(
    "Comparison Follow-Up",
    [{ query: "Compare SAHAI and ORBITAIR.", response: "Both are advanced systems." }],
    "Which one is more scalable?",
    "SAHAI and ORBITAIR"
  );
  if (!t2) allPassed = false;

  // Test 3: Repository Follow-Up
  const t3 = await testScenario(
    "Repository Follow-Up",
    [{ query: "Summarize oracle-sync-test.", response: "It tests Oracle sync pipeline." }],
    "What technologies does it use?",
    "oracle-sync-test"
  );
  if (!t3) allPassed = false;

  // Test 4: Recruiter Follow-Up
  const t4 = await testScenario(
    "Recruiter Follow-Up",
    [{ query: "Which project demonstrates backend engineering?", response: "ORBITAIR" }],
    "Why?",
    "ORBITAIR"
  );
  if (!t4) allPassed = false;

  console.log("\n========================================");
  if (allPassed) {
    console.log("🎉 ALL FOLLOW-UP SCENARIOS COMPLETED SUCCESSFULLY! 🎉");
  } else {
    console.log("🔴 SOME SCENARIOS ENCOUNTERED FAILURES! 🔴");
  }
  console.log("========================================\n");
}

runAllScenarios().catch(console.error);
